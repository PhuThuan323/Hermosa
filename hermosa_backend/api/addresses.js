const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const add = require('../models/address')
const axios = require('axios')
dotenv.config();

//Gợi ý địa chỉ khi người dùng nhập vào ô tìm kiếm địa chỉ
router.get('/suggestion', async (req, res) => {
    try {
        const input = req.query.input;

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?autocomplete=true&limit=5&language=vi&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;

        const response = await axios.get(url);

        const suggestions = response.data.features.map(item => ({
            name: item.place_name,
            street: item.text,
            ward: item.context?.find(v => v.id.includes('place'))?.text || "",
            district: item.context?.find(v => v.id.includes('district'))?.text || "",
            city: item.context?.find(v => v.id.includes('region'))?.text || "",
            country: item.context?.find(v => v.id.includes('country'))?.text || "",
            lat: item.geometry.coordinates[1],
            lon: item.geometry.coordinates[0],
        }));

        return res.json({ message: "Lấy địa chỉ gợi ý thành công", data: suggestions });
    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
});

// THÊM ĐỊA CHỈ MỚI - Lưu địa chỉ vào cơ sở dữ liệu 
router.post('/add', async (req, res) => {
    try {
        const { name, userID, addressDetail, phone, type } = req.body;
        let user = await add.findOne({userID});
        if (!user) {
            user = new add({
                userID, deliverInformation: [] });
        }
        const addressID = `ADDR-${Date.now()}`;

        user.deliverInformation.push({
            name,
            addressID,
            addressDetail: {
                street: addressDetail.street,
                ward: addressDetail.ward,
                district: addressDetail.district,
                city: addressDetail.city,
                country: addressDetail.country
            },
            phone,
            type
        });

        await user.save();
        return res.status(200).json({ 
            message: "Lưu địa chỉ thành công!", 
            data: user 
        });
    } catch (err) {
        return res.status(500).json({ message: "Không thể lưu địa chỉ vào cơ sở dữ liệu", details: err.message });
    }
});


// LẤY TẤT CẢ ĐỊA CHỈ lọc theo type 
router.get('/show', async (req, res) => {
    try {
        const { userID, type } = req.query;
        const user = await add.findOne({ userID });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        const filteredAddresses = type ? user.deliverInformation.filter(addr => addr.type === type) : user.deliverInformation;
        res.status(200).json({
            message: `Lấy danh sách địa chỉ loại ${type} của user ${userID} thành công`,
            data: filteredAddresses
        });

    } catch (err) {
        return res.status(500).json({ message: "Lỗi hệ thống", details: err.message });
    }
});

// XÓA ĐỊA CHỈ
router.delete('/delete', async (req, res) => {
    try {
        const { userID, addressID } = req.body;
        const result = await add.findOne({ userID });
        if (!result) { return res.status(404).json({ message: "User không tồn tại" }); }
        result.deliverInformation = result.deliverInformation.filter( item => item.addressID !== addressID)
        await result.save();
        return res.status(200).json({
            message: "Xóa địa chỉ thành công",
            data: result.deliverInformation
        });

    } catch (err) {
        return res.status(500).json({ message: "Không thể xóa địa chỉ", details: err.message });
    }
});


// CẬP NHẬT ĐỊA CHỈ
router.put('/update', async (req, res) => {
    try {
        const { name, userID, addressID, addressDetail, phone, type } = req.body;
        const user = await add.findOne({ userID });
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại" });
        }
        const item = user.deliverInformation.find(i => i.addressID === addressID);
        if (!item) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
        }
        item.name = name
        item.phone = phone
        item.addressDetail = {
            street: addressDetail.street,
            ward: addressDetail.ward,
            district: addressDetail.district,
            city: addressDetail.city,
            country: addressDetail.country
        }
        item.type = type
        await user.save();
        return res.status(200).json({ message: "Cập nhật địa chỉ giao hàng thành công", data: user });
    } catch (err) {
        return res.status(500).json({ message: "Không thể cập nhật địa chỉ", details: err.message });
    }
});

//Tính phí giao hàng trong bán kính 5km được miễn phí, 6km là 15k, từ 7 đến dưới 10km cộng thêm mỗi km 10k, từ 11 đến 20km (mỗi km tăng thêm 15k)
//Trên 20km không nhận giao hàng


//Tự động tìm và điền địa chỉ hiện tại của người dùng

module.exports = router
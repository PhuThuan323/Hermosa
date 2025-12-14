const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const add = require('../../models/address')
const axios = require('axios')

dotenv.config();

//Gợi ý địa chỉ khi người dùng nhập vào ô tìm kiếm địa chỉ
router.get('/suggestion', async (req, res) => {
    try {
        const input = req.query.input;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?autocomplete=true&limit=5&language=vi&access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
        const response = await axios.get(url)
        const feature = response.data.features;
        
        return res.json({ message: "Lấy địa chỉ gợi ý thành công", data: feature });
    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
})

function matchTextFromList(input, list, key) {
    const lowerInput = input.toLowerCase()
    let found = list.find(item => item[key].toLowerCase() === lowerInput);
    if (found) return found
    found = list.find(item => lowerInput.includes(item[key].toLowerCase()));
    if (found) return found
    found = list.find(item => item[key].toLowerCase().includes(lowerInput));
    if (found) return found;
    return null;
}

async function parseAddressUsingGHN(input) {
    const rawParts = input
        .split(",")
        .map(p => p.trim())
        .filter(Boolean)

    const Token = process.env.GHN_TOKEN
    const provincesRes = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {},
        { headers: { Token } }
    );
    const provinces = provincesRes.data.data

    let choosingProvince = null
    for (const part of rawParts) {
        choosingProvince = matchTextFromList(part, provinces, "ProvinceName");
        if (choosingProvince) break
    }
    if (!choosingProvince) throw new Error("Không tìm thấy tỉnh/thành trong GHN!");

    const districtsRes = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        { province_id: choosingProvince.ProvinceID },
        { headers: { Token } }
    );
    const districts = districtsRes.data.data;

    let choosingDistrict = null;
    for (const part of rawParts) {
        choosingDistrict = matchTextFromList(part, districts, "DistrictName");
        if (choosingDistrict) break;
    }
    if (!choosingDistrict) throw new Error("Không tìm thấy quận GHN!");

    const wardsRes = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        { district_id: choosingDistrict.DistrictID },
        { headers: { Token } }
    );
    const wards = wardsRes.data.data;

    let choosingWard = null;
    for (const part of rawParts) {
        choosingWard = matchTextFromList(part, wards, "WardName");
        if (choosingWard) break;
    }
    if (!choosingWard) throw new Error("Không tìm thấy phường GHN!");

    const ignoreList = [
        choosingProvince.ProvinceName.toLowerCase(),
        choosingDistrict.DistrictName.toLowerCase(),
        choosingWard.WardName.toLowerCase(),
        "việt nam"
    ];

    const street = rawParts
        .filter(p => !ignoreList.some(i => p.toLowerCase().includes(i)))
        .join(", ");

    return {
        province: choosingProvince,
        district: choosingDistrict,
        ward: choosingWard,
        street
    };
}

//Thêm địa chỉ mới
router.post('/add', async (req, res) => {
    try {
        const { name, userID, address, phone, type } = req.body;
        const choosing = await parseAddressUsingGHN(address);
        const addressID = `ADDR-${Date.now()}`;
        let user = await add.findOne({userID})
        if (!user) {
            user = new add({
                userID,
                deliverInformation: []

            });
        }
        user.deliverInformation.push({
            name,
            addressID,
            addressDetail: address,
            ghn: {
                provinceID: choosing.province.ProvinceID,
                districtID: choosing.district.DistrictID,
                wardCode: choosing.ward.WardCode
            },
            phone,
            type
        })
        await user.save();
        return res.json({ message: "Lưu địa chỉ thành công!", data: user });

    } catch (err) {
        return res.status(500).json({ message: "Lỗi khi lưu địa chỉ", details: err.response?.data || err.message})
    }
})


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
            province: addressDetail.province,
            country: addressDetail.country
        }
        item.type = type
        await user.save();
        return res.status(200).json({ message: "Cập nhật địa chỉ giao hàng thành công", data: user });
    } catch (err) {
        return res.status(500).json({ message: "Không thể cập nhật địa chỉ", details: err.message });
    }
});


module.exports = router
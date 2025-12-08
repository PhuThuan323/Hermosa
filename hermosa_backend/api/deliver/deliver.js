const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const add = require('../../models/address')
const order = require('../../models/order')
const axios = require('axios')
const address = require('../../models/address')
dotenv.config();

async function getServiceID({ toDistrict }) {
    const res = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
        {
            shop_id: Number(process.env.GHN_SHOP_ID),
            from_district: Number(process.env.GHN_FROM_DISTRICT_ID),
            to_district: toDistrict
        },
        {
            headers: {
                "Content-Type": "application/json",
                Token: process.env.GHN_TOKEN
            }
        }
    );

    // Trả về service_id đầu tiên (dịch vụ phù hợp nhất)
    return res.data.data[0].service_id;
}

//Tính phí giao hàng 
async function calculateShippingFee({ addressID }) {
    try {
        const fAddress = await add.findOne({ "deliverInformation.addressID": addressID });

        if (!fAddress) throw new Error("Không tìm thấy user với addressID này");

        const addressInfo = fAddress.deliverInformation.find(
            addr => addr.addressID === addressID
        );

        if (!addressInfo) throw new Error("Không tìm thấy địa chỉ");

        if (!addressInfo.ghn)
            throw new Error("Địa chỉ này chưa có thông tin GHN (ghn: {...})");

        const body = {
            service_id: await getServiceID({
                toDistrict: addressInfo.ghn.districtID
            }),
            service_type_id: 1,
            to_district_id: addressInfo.ghn.districtID,
            to_ward_code: addressInfo.ghn.wardCode,
            from_district_id: Number(process.env.GHN_FROM_DISTRICT_ID),
            from_ward_code: process.env.GHN_FROM_WARD_CODE,
            weight: 500,
            length: 20,
            width: 20,
            height: 10
        };

        const headers = {
            "Content-Type": "application/json",
            Token: process.env.GHN_TOKEN,
            ShopId: process.env.GHN_SHOP_ID
        };

        const res = await axios.post(
            "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
            body,
            { headers }
        );

        return res.data.data;

    } catch (err) {
        throw err;
    }
}


router.post("/calculate-fee", async (req, res) => {
    try {
        const { userID, tipsforDriver, addressID } = req.body
        const shippingFee = await calculateShippingFee({ addressID })
        let fOrder = await order.findOne({ userID })
        let fAdd = await add.findOne({userID})
        fOrder.deliveryFee = shippingFee.total
        fOrder.tipsforDriver = tipsforDriver
        for(let i of fAdd.deliverInformation){
            if(i.addressID === addressID){
                fOrder.deliverAddress = i.addressDetail
                break
            }
        }
        fOrder.finalTotal = Number(fOrder.totalInvoice) - Number(fOrder.discountAmount) + Number(fOrder.deliveryFee) + Number(fOrder.tipsforDriver)
        await fOrder.save()
        return res.status(200).json({ message: "Tính phí thành công", data: fOrder })
    } catch (err) {
        return res.status(500).json({ message: "Tính phí thất bại", details: err.message })
    }
})


// Giả sử đơn hàng đang được giao đến nơi
router.post('/update-deliver-order', async (req, res) => {
    try {
        const { orderID } = req.body
        const fOrder = await order.findOne({ orderID })
        if(fOrder.paymentStatus === "done"){
            fOrder.status = "done"
            fOrder.deliverIn = new Date()
            await fOrder.save()
            return res.status(200).json({ message: "Cập nhật trạng thái giao đơn hàng thành công", data: fOrder })
        }
        else{
            return res.status(200).json({message: "Đơn hàng chưa được thanh toán thành công", data: fOrder })
        }
    } catch (err) {
        return res.status(500).json({ message: "Cập nhật đơn hàng thất bại", details: err.message })
    }
});



module.exports = router
const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const add = require('../models/address')
const order = require('../models/order')
const axios = require('axios')
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

        const addressInfo = fAddress.deliverInformation.find(
            addr => addr.addressID === addressID
        );

        const body = {
            service_id: await getServiceID({ toDistrict: addressInfo.addressDetail.ghn.districtID}),
            service_type_id: 1,
            to_district_id: addressInfo.addressDetail.ghn.districtID,
            to_ward_code: addressInfo.addressDetail.ghn.wardCode,
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
        const { orderID, addressID } = req.body
        const fee = await calculateShippingFee({ addressID })
        const fOrder = await order.findOne({ orderID })
        if(fOrder.totalInvoiceAfterVoucher === 0){
            fOrder.totalInvoiceAfterShip = fee.total + fOrder.totalInvoice
        }
        else{
            fOrder.totalInvoiceAfterShip = fee.total + fOrder.totalInvoiceAfterVoucher
        }
        await fOrder.save()
        return res.status(200).json({ message: "Tính phí thành công", data: fee })
    } catch (err) {
        return res.status(500).json({ message: "Tính phí thất bại", details: err.message })
    }
})

// //Gọi giao hàng qua GHN 
// router.post("/create-ghn-order", async (req, res) => {
//     try {
//         const { orderID, addressID } = req.body
//         const fOrder = await order.findOne({ orderID })
//         const fAddress = await add.findOne({ "deliverInformation.addressID": addressID });
//         const addressInfo = fAddress.deliverInformation.find(
//             addr => addr.addressID === addressID
//         )

//         const body = {
//             payment_type_id: 2,
//             to_name: addressInfo.name,
//             to_phone: addressInfo.phone,
//             to_address: `${addressInfo.addressDetail.specificAddress}, ${addressInfo.addressDetail.ward}, ${addressInfo.addressDetail.district}, ${addressInfo.addressDetail.province}`,
//             to_ward_code: addressInfo.addressDetail.ghn.wardCode,
//             to_district_id: addressInfo.addressDetail.ghn.districtID,
//             weight: 500,
//             length: 20,
//             width: 20,
//             height: 10,
//             service_id: await getServiceID({ toDistrict: addressInfo.addressDetail.ghn.districtID }),
//             service_type_id: 1,
//             insurance_value: fOrder.totalInvoiceAfterShip,
//             coupon: null,
//             cod_amount: fOrder.totalInvoiceAfterShip,
//             content: `Thanh toán đơn hàng ${orderID} cho Hermosa Coffee`,
//             shop_id: Number(process.env.GHN_SHOP_ID)
//         };
//         const headers = {
//             "Content-Type": "application/json",
//             Token: process.env.GHN_TOKEN,
//             ShopId: process.env.GHN_SHOP_ID
//         };
//         const ghnRes = await axios.post(
//             "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
//             body,
//             { headers }
//         );
//         fOrder.orderID = ghnRes.data.data.order_code
//         fOrder.shippingStatus = "Đang xử lý"
//         fOrder.shippingFee = shippingFee.total
//         await fOrder.save()
//         return res.status(200).json({ message: "Tạo đơn hàng GHN thành công", data: ghnRes.data.data })
//     }
//     catch (err) {
//         return res.status(500).json({ message: "Tạo đơn hàng GHN thất bại", details: err.response?.data || err.message })
//     }
// });

// Cập nhật đơn hàng thủ công (gải sử khi người dùng đã nhận được hàng)
router.post('/update-deliver-order', async (req, res) => {
    try {
        const { orderID } = req.body
        const fOrder = await order.findOne({ orderID })
        fOrder.deliver = true
        fOrder.status = "done"
        fOrder.deliverIn = new Date()
        await fOrder.save()
        return res.status(200).json({ message: "Cập nhật đơn hàng thành công", data: fOrder })
    } catch (err) {
        return res.status(500).json({ message: "Cập nhật đơn hàng thất bại", details: err.message })
    }
});



module.exports = router
const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const order = require('../models/order')
const { VNPay, ignoreLogger, VnpLocale, dateFormat, ProductCode } = require('vnpay')

//------------------ API TẠO THANH TOÁN VNPay ------------------
router.post("/create-payment-vnpay", async(req,res)=>{
    try{
        const {orderID} = req.body
        const fOrder = await order.findOne({orderID})
        const vnpay = new VNPay({
            tmnCode: process.env.VNP_TMN_CODE,
            secureSecret: process.env.VNP_HASH_SECRET,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: 'SHA512',
            loggerFn: ignoreLogger
        })
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate()+1)

        const vnpayResponse = await vnpay.buildPaymentUrl({
            vnp_Amount: fOrder.totalInvoice,
            vnp_IpAddr: '127.0.0.1',
            vnp_TxnRef: fOrder.orderID,
            vnp_OrderInfo: `Thanh toán đơn hàng ${fOrder.orderID}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow)
        })
        return res.status(200).json(vnpayResponse)
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }

})
router.get('/check-payment-status', async (req,res)=>{
    try{
        const fOrder = await order.findOne({orderID: req.query.vnp_TxnRef})
    if(!fOrder){
        return res.status(404).json({message: 'Đơn hàng không tồn tại'})
    }
    if(req.query.vnp_ResponseCode === '00'){
        fOrder.paymentStatus = 'Đã thanh toán'
        await fOrder.save()
        res.status(200).json({message: 'Thanh toán thành công'})
        return res.redirect('hermosaapp://payment-success') 

    }
    return res.redirect('hermosaapp://payment-failed')
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})

module.exports = router;

const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const { VNPay, ignoreLogger, VnpLocale, dateFormat, ProductCode } = require('vnpay')
const order = require('../../models/order')
dotenv.config()

// ---------------------- TẠO URL THANH TOÁN VNPAY ---------------------------
router.post("/create", async(req,res)=>{
    try{
        console.log("=== [VNPAY CREATE] BODY INPUT ===")
        console.log(req.body)

        const {orderID} = req.body
        console.log("[CREATE] Nhận orderID:", orderID)

        const fOrder = await order.findOne({orderID})
        console.log("[CREATE] Tìm đơn hàng:", fOrder)

        if (!fOrder) {
            console.log("[CREATE] ❌ Không tìm thấy đơn hàng")
            return res.status(404).json({message: 'Không tìm thấy đơn hàng'})
        }

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

        console.log("[CREATE] Tổng tiền:", fOrder.totalInvoice)

        const vnpayResponse = await vnpay.buildPaymentUrl({
            vnp_Amount: fOrder.totalInvoice * 100,  // thường phải *100
            vnp_IpAddr: req.ip || '127.0.0.1',
            vnp_TxnRef: fOrder.orderID,
            vnp_OrderInfo: `Thanh toán đơn hàng ${fOrder.orderID}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow)
        })

        console.log("[CREATE] 🔥 URL THANH TOÁN TẠO THÀNH CÔNG:")
        console.log(vnpayResponse)

        return res.status(200).json(vnpayResponse)
    }
    catch(err){
        console.log("❌ [CREATE ERROR] ", err)
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})


// ------------------------- KIỂM TRA THANH TOÁN ------------------------------
router.get('/check-payment-status', async (req,res)=>{
    try{
        console.log("\n=== [VNPAY RETURN] RAW QUERY ===")
        console.log(req.query)

        const txnRef = req.query.vnp_TxnRef
        console.log("[CHECK] Tìm đơn hàng có orderID = ", txnRef)

        const fOrder = await order.findOne({orderID: txnRef})
        console.log("[CHECK] Đơn hàng tìm được:", fOrder)

        if(!fOrder){
            console.log("[CHECK] ❌ Không tìm thấy đơn hàng trong DB")
            return res.status(404).json({message: 'Đơn hàng không tồn tại'})
        }

        if(req.query.vnp_ResponseCode === '00'){
            console.log("[CHECK] 🎉 Thanh toán thành công! Cập nhật DB...")

            fOrder.paymentStatus = "done"
            fOrder.payingIn = Date.now()

            await fOrder.save()

            console.log("[CHECK] ✔ DB đã cập nhật:", fOrder)

            return res.status(200).json({message: 'Thanh toán thành công', data: fOrder})
        }
        else{
            console.log("[CHECK] ⏳ Thanh toán không thành công. Mã:", req.query.vnp_ResponseCode)
            return res.status(200).json({message: "Đơn hàng chưa được thanh toán", data: fOrder})
        }
    }
    catch(err){
        console.log("❌ [CHECK ERROR] ", err)
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})

module.exports = router

const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const order = require('../../models/order')
const crypto = require('crypto')
const axios = require('axios')
dotenv.config()

//----------------------------TẠO YÊU CẦU THANH TOÁN VỚI MOMO--------------------
let orderIDGOC = 0
router.post('/create', async (req, res) => {
    try {
        const { orderID } = req.body
        let total = 0
        const findOrder = await order.findOne({ orderID })
        if (!findOrder) {
            console.log("[CREATE PAYMENT] Order not found:", orderID);
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        var partnerCode = "MOMO";
        var accessKey = process.env.MOMO_ACCESS_KEY;
        var secretkey = process.env.MOMO_SECRET_KEY;
        var requestId = partnerCode + new Date().getTime();
        var orderId = requestId;
        var orderInfo = "Paying your order: " + orderID + " by Momo";
        var redirectUrl = process.env.MOMO_REDIRECT_URL;
        var ipnUrl = "https://bfd1855319b3.ngrok-free.app/momo/momo-notify"
        var amount = findOrder.finalTotal.toString()
        var requestType = "captureWallet"
        var extraData = "";
        orderIDGOC = orderID
        var rawSignature =
            "accessKey=" + accessKey +
            "&amount=" + amount +
            "&extraData=" + extraData +
            "&ipnUrl=" + ipnUrl +
            "&orderId=" + orderId +
            "&orderInfo=" + orderInfo +
            "&partnerCode=" + partnerCode +
            "&redirectUrl=" + redirectUrl +
            "&requestId=" + requestId +
            "&requestType=" + requestType;

        console.log("[CREATE PAYMENT] Raw signature:", rawSignature);

        var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');
        console.log("[CREATE PAYMENT] Generated signature:", signature);

        const requestBody = {
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'en'
        }

        const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', 
                                          requestBody, 
                                          { headers: { 'Content-Type': 'application/json' } })
        const payUrl = response.data.payUrl || null
        findOrder.paymentMethod = "momo"
        findOrder.paymentStatus = "not_done";
        await findOrder.save()

        return res.status(201).json({
            message: "Successfully created Momo payment request",
            payUrl: payUrl,
            rawResponse: response.data
        })

    } catch (error) {
        return res.status(500).json({ message: "Server error", detail: error.message });
    }
});

//----------------------------MOMO CALLBACK / NOTIFY--------------------
// 1) ở file main (app.js hoặc index.js) khi dùng body parser, thêm verify để lưu raw body
// app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));

router.post('/momo-notify', async (req, res) => {
  try {
    const {
      partnerCode, orderId, requestId, amount, orderInfo,
      orderType, transId, resultCode, message, payType,
      responseTime, extraData = "", signature
    } = req.body;

    if (resultCode === 0) {
      const orderIDGOC = (orderInfo && (orderInfo.match(/(ORD-[0-9]+)/) || [])[1]) || null;
      if (!orderIDGOC) {
        return res.status(400).json({ message: "Invalid orderInfo format" })
      }
      const foundOrder = await order.findOne({ orderID: orderIDGOC })
      if (!foundOrder) return res.status(404).json({ message: "Order not found" })

      foundOrder.paymentStatus = "done"
      foundOrder.payingIn = Date.now()
      await foundOrder.save()
      return res.status(200).json({ message: "Payment confirmed", data: foundOrder })
    }

    return res.status(200).json({ message: "Payment not successful", detail: message })

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message })
  }
});

//----------------------------CONFIRM PAYMENT--------------------
router.get('/confirm', async (req, res) => {
    try {
        let { orderID } = req.query
        const findOrder = await order.findOne({ orderID })
        if (!findOrder) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch" })
        }
        if(findOrder.paymentStatus === "done"){
            return res.status(200).json({ message: "Đơn hàng đã được thanh toán thành công", data: findOrder})
        }
        else if (findOrder.paymentMethod === "not_done"){
            return res.status(200).json({ message: "Đơn hàng chưa được thanh toán thành công", data: findOrder})
        }
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;

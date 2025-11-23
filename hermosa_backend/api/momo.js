const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const order = require('../models/order')
const crypto = require('crypto')
const axios = require('axios')
dotenv.config()

//----------------------------TẠO YÊU CẦU THANH TOÁN VỚI MOMO--------------------
let orderIDGOC = 0
router.post('/create-payment-momo', async (req, res) => {
    try {
        const { orderID, userID } = req.body
        console.log("[CREATE PAYMENT] Request body:", req.body);

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
        var ipnUrl = "http://13.250.179.85/payment-momo/momo-notify";
        var amount = findOrder.totalInvoice.toString();
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
        };

        console.log("[CREATE PAYMENT] Request body to Momo:", requestBody);

        const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', 
                                          requestBody, 
                                          { headers: { 'Content-Type': 'application/json' } });
        console.log("[CREATE PAYMENT] Response from Momo:", response.data);

        const payUrl = response.data.payUrl || null;

        findOrder.paymentMethod = "momo";
        findOrder.paymentStatus = "not_done";
        await findOrder.save();
        console.log("[CREATE PAYMENT] Order updated in DB:", findOrder);

        return res.status(201).json({
            message: "Successfully created Momo payment request",
            payUrl: payUrl,
            rawResponse: response.data
        });

    } catch (error) {
        console.error("[CREATE PAYMENT] Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
});

//----------------------------MOMO CALLBACK / NOTIFY--------------------
router.post('/momo-notify', async (req, res) => {
    try {
        console.log("[MOMO NOTIFY] Request body:", req.body);

        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature,
        } = req.body;

        const rawSignature =
            "amount=" + amount +
            "&extraData=" + extraData +
            "&message=" + message +
            "&orderId=" + orderId +
            "&orderInfo=" + orderInfo +
            "&orderType=" + orderType +
            "&partnerCode=" + partnerCode +
            "&payType=" + payType +
            "&requestId=" + requestId +
            "&responseTime=" + responseTime +
            "&resultCode=" + resultCode +
            "&transId=" + transId;

        console.log("[MOMO NOTIFY] Raw signature to check:", rawSignature);

        const checkSignature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY)
            .update(rawSignature)
            .digest('hex');

        console.log("[MOMO NOTIFY] Signature from Momo:", signature);
        console.log("[MOMO NOTIFY] Generated signature:", checkSignature);

        if (checkSignature !== signature) {
            console.log("[MOMO NOTIFY] Invalid signature!");
            return res.status(400).json({ message: "Invalid signature" });
        }

        if (resultCode === 0) {
          const result = await order.findOne({ orderID: orderIDGOC});
          if (result) {
            result.paymentStatus = "done";
            result.payingIn = Date.now();
            await result.save();
            console.log("[MOMO NOTIFY] Payment updated successfully:", result);
        } else {
          console.log("[MOMO NOTIFY] Cannot find order for:", originalOrderId);
        }
}

        res.status(200).json({ message: "OK" });

    } catch (error) {
        console.error("[MOMO NOTIFY] Callback error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
});

//----------------------------CONFIRM PAYMENT--------------------
router.get('/confirm', async (req, res) => {
    try {
        let { orderID } = req.query;
        console.log("[CONFIRM] OrderID query:", orderID);

        const findOrder = await order.findOne({ orderID });
        if (!findOrder) {
            console.log("[CONFIRM] Order not found:", orderID);
            return res.status(404).json({ message: "Không tìm thấy giao dịch" });
        }

        console.log("[CONFIRM] Order found:", findOrder);
        return res.status(200).json({
            orderID: orderID,
            status: findOrder.paymentStatus,
            method: findOrder.paymentMethod,
            time: findOrder.payingIn,
        });

    } catch (error) {
        console.error("[CONFIRM] Server error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;

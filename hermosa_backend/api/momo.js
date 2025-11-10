const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const order = require('../models/order')
const crypto = require('crypto')
const axios = require('axios')
dotenv.config()

//----------------------------TẠO YÊU CẦU THANH TOÁN VỚI MOMO--------------------

router.post('/create-payment-momo', async (req, res)=>{
    
    const {orderID, userID} = req.body
    const findOrder = await order.findOne({orderID})
    if (!findOrder) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        
        var partnerCode = "MOMO";
        var accessKey = "F8BBA842ECF85";
        var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        var requestId = partnerCode + new Date().getTime();
        var orderId = requestId;
        var orderInfo = "Paying your order: " + orderID + " by Momo"; //nội dung giao dịch
        var redirectUrl = process.env.MOMO_REDIRECT_URL; 
        var ipnUrl = "http:/localhost:8000/payment/momo-notify";
        // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
        var amount = findOrder.totalInvoice.toString();
        var requestType = "captureWallet"
        var extraData = ""; //pass empty value if your merchant does not have stores
        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType

    var rawSignature = 
    "accessKey="+accessKey+
    "&amount=" + amount+
    "&extraData=" + extraData+
    "&ipnUrl=" + ipnUrl+
    "&orderId=" + orderId+
    "&orderInfo=" + orderInfo+
    "&partnerCode=" + partnerCode +
    "&redirectUrl=" + redirectUrl+
    "&requestId=" + requestId+
    "&requestType=" + requestType
    // puts raw signature
    // console.log("--------------------RAW SIGNATURE----------------")
    // console.log(rawSignature)
    var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');
    // console.log("--------------------SIGNATURE----------------")
    // console.log(signature)
        
    const requestBody = JSON.stringify({
        partnerCode : partnerCode,
        accessKey : accessKey,
        requestId : requestId,
        amount : amount,
        orderId : orderId,
        orderInfo : orderInfo,
        redirectUrl : redirectUrl,
        ipnUrl : ipnUrl,
        extraData : extraData,
        requestType : requestType,
        signature : signature,
        lang: 'en'
    })
    const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', 
                          requestBody,
                          { headers: { 'Content-Type': 'application/json' } } );
    const payUrl = response.data.payUrl;

    findOrder.paymentMethod = "momo"
    findOrder.paymentStatus = "not_done"
    await findOrder.save();

    return res.status(201).json({
        message: "Successfull create momo paying request",
        payUrl: payUrl
    });
})
//ipnurl -> môm gửi callback đến server 
router.post('/momo-notify', async (req, res) => {
  try {
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

    const checkSignature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (checkSignature !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    if (resultCode === 0) {
      await order.findOneAndUpdate(
        { orderID: orderId },
        { paymentStatus: "done", payingIn: new Date() }
      );
      return res.status(200).json({ message: "Payment successful" });
    } else {
      return res.status(400).json({ message: "Payment failed", detail: message });
    }
  } catch (error) {
    console.error("Callback error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

router.get('/confirm', async(req,res)=>{
    try{
        let {orderID} = req.query
        const findOrder = await order.findOne({orderID})
        if (!findOrder) return res.status(404).json({ message: "Không tìm thấy giao dịch" });
        return res.status(200).json({
            orderID: orderID,
            status: findOrder.paymentStatus,
            method: findOrder.paymentMethod,
            time: findOrder.payingIn,
        });
    }
    catch{
        return res.status(500).json({ message: "Server error", error });
    }
})

module.exports = router
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const noti = require('../models/notification')
const admin = require('../config/firebase')
const user = require('../models/user')
dotenv.config();

//Tạo thông báo mới 
router.post('/create', async (req,res)=>{
    try{
        const {userIDlist, title, message} = req.body
        const newNoti = new noti({
            userIDlist,
            title,
            message,
            createdAt: new Date()
        })
        await newNoti.save()
        res.status(200).json({message: "Tạo thông báo mới thành công", data: newNoti})
    }
    catch(err){
        res.status(500).json({message: "Lỗi hệ thống", details: err.message})
    }
})
//Lấy danh sách thông báo theo user
router.get('/list/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const noti = await Notification.find({ "userIDlist.userID": userId }).sort({ createdAt: -1 });
        res.json({ status: "Success", message: "Lấy danh sách thông báo thành công", data: noti });
    }
    catch (err) {
        res.json({ status: "Failed", message: "Lấy danh sách thông báo thất bại", data: err });
    }
});
//Xóa một thông báo
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.json({ status: "Success", message: "Xóa thông báo thành công" });
    }
    catch (err) {
        res.json({ status: "Failed", message: "Xóa thông báo thất bại", data: err });
    }
});
//Xóa tất cả thông báo
router.delete('/delete-all/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.deleteMany({ "userIDlist.userID": userId });
        res.json({ status: "Success", message: "Đã xóa tất cả thông báo" });
    }
    catch (err) {
        res.json({ status: "Failed", message: "Xóa thông báo thất bại", data: err });
    }
});
//Lưu lại FCM Token với riêng từng user, từng app 
//Token này đươcj front-end gửi đến cho back-end, back-end lưu trữ token này vào cơ sở dữ liệu để gửi thông báo đến đúng user.
router.post('/save-fcm-token', async (req,res)=>{
    const { userId, fcmToken } = req.body
    await user.findByIdAndUpdate(userId,{
        fcmToken: fcmToken
    })
    res.json({message: "Đã lưu lại token của người dùng"})
})

//Gửi thông báo
router.post('/send', async (req,res)=>{
    const {userID, title, body} = req.body
    const fUser = await user.findOne({userID})
    const fcmToken = user.fcmToken
    if(!fcmToken){
        return res.json({ message: "User chưa có FCM token" });
    }
    const message = {
        notification:{
            title: title,
            body: body
        },
        token: fcmToken
    }
    try{
        const response = await admin.messaging().send(message);
        res.jsonp({message: "Đã gửi thành công", result: response})
    }
    catch(err){
        res.json({ message: "Gửi thông báo thất bại", detail: err.message });
    }
})
module.exports = router
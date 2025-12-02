const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const noti = require('../models/notification')
const admin = require('../config/firebase')
const user = require('../models/user')
const cron = require('node-cron');
dotenv.config();

//Lưu lại FCM Token với riêng từng user, từng app 
//Token này đươcj front-end gửi đến cho back-end, back-end lưu trữ token này vào cơ sở dữ liệu để gửi thông báo đến đúng user.
router.post('/save-fcm-token', async (req,res)=>{
    try{
        const { userID, fcmToken } = req.body
        const fUser = await user.findById(userID)
        if (!fUser.fcmToken) {
            fUser.fcmToken = fcmToken;
            await fUser.save();
            return res.status(200).json({message: "Đã lưu lại token của người dùng", data: fUser});
        }
        else{
            return res.status(200).json({message: "Token của người dùng đã tồn tại", data: fUser})
        }
        
    }
    catch(err){
        res.status(500).json({message: "Không thể lưu lại token của người dùng", details: err.message})
    }
})

//Tạo thông báo mới 
router.post('/create', async (req,res)=>{
    try{
        const { title, message, scheduleAt } = req.body
        let notificationID = `NOTI-${Date.now()}`
        const newNoti = new noti({
            notiID: notificationID,
            userIDlist: [],
            title,
            message,
            createdAt: new Date(),
            scheduleAt
        })
        await newNoti.save()
        res.status(200).json({ message: "Tạo thông báo mới thành công", data: newNoti })
    }
    catch(err){
        res.status(500).json({message: "Lỗi hệ thống", details: err.message})
    }
})

//Gửi thông báo cho tất cả user ngay lập tức
router.post('/send-all', async (req,res)=>{
    try{
        const { notificationID, scheduleAt } = req.body
        const fNoti = await noti.findOne({ notiID: notificationID });
        const fUser = await user.find().lean()
        if(scheduleAt === null){
            const fcm_tokens_list = fUser.map(u => u.fcmToken).filter(token => token); 
            const payload = {
                notification: {
                    title: fNoti.title,
                    body: fNoti.message,
                },
                data: {
                    notificationID: notificationID,
                }
            }
            fNoti.sent = true
            fNoti.sendtoAll = true
            await fNoti.save()
            const response = await admin.messaging().sendEachForMulticast({
                tokens: fcm_tokens_list,
                ...payload
            })
            return res.status(200).json({
                message: "Gửi thông báo thành công",
                successCount: response.successCount,
                failureCount: response.failureCount,
                totalTokens: fcm_tokens_list.length
            })
        }
        else{
            await noti.updateOne(
                { notiID: notificationID }, 
                { scheduleAt: scheduleAt, sendtoAll: true }
            )
            return  res.status(200).json({ message: "Lên lịch gửi thông báo thành công", data: fNoti }); 
        }
    }
    catch(err){
        res.status(500).json({message: "Gửi thông báo thất bại", details: err.message})
    }
})

// Gửi thông báo cho những user cụ thể
router.post('/send-to-users', async (req, res) => {
    try {
        const { notificationID, userIDlist, scheduleAt } = req.body;
        if (!notificationID || !Array.isArray(userIDlist) || userIDlist.length === 0) {
            return res.status(400).json({ message: "Thiếu notificationID hoặc userIDlist rỗng" });
        }
        const fNoti = await noti.findOne({ notiID: notificationID })
        if (!fNoti) {
            return res.status(404).json({ message: "Không tìm thấy thông báo" });
        }
        if (scheduleAt === null) {
            const fcm_tokens_list = [];
            for (const uid of userIDlist) {
                const fUser = await user.findOne({ userID: uid }).lean();
                if (fUser?.fcmToken) {
                    fcm_tokens_list.push(fUser.fcmToken);
                }
            }
            if (fcm_tokens_list.length === 0) {
                return res.status(400).json({ message: "Không có user nào có FCM Token hợp lệ" });
            }
            const payload = {
                notification: {
                    title: fNoti.title,
                    body: fNoti.message,
                },
                data: {
                    notificationID: notificationID,
                }
            }  
            const response = await admin.messaging().sendEachForMulticast({
                tokens: fcm_tokens_list,
                ...payload
            })
            fNoti.userIDlist = userIDlist;
            fNoti.sent = true;
            await fNoti.save();
            return res.status(200).json({
                message: "Gửi thông báo thành công",
                successCount: response.successCount,
                failureCount: response.failureCount,
                totalTokens: fcm_tokens_list.length
            })
        }
        else {
            fNoti.userIDlist = userIDlist.map(uid => ({ userID: uid }));
            fNoti.scheduleAt = scheduleAt;
            await fNoti.save();
            return res.status(200).json({ message: "Lên lịch gửi thông báo thành công", data: fNoti });
        }
    } catch (err) {
        res.status(500).json({ message: "Gửi thông báo thất bại", details: err.message });
    }
});


//Lấy danh sách thông báo theo user sắp xếp thông báo theo thứ tự thời gian từ mới nhất đến cũ nhất 
router.get('/list', async (req, res) => {
    try {
        const { userID } = req.query
        const notification = await noti.find(
            { 
                $or: [ 
                    { sendtoAll: true }, 
                    { "userIDlist.userID": userID } 
                ] 
            }).sort({ createdAt: -1 })
        res.json({ status: "Success", message: "Lấy danh sách thông báo thành công", data: notification });
    }
    catch (err) {
        res.json({ status: "Failed", message: "Lấy danh sách thông báo thất bại", data: err });
    }
});

//Gửi theo lịch đã được schedule trước 
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const notifications = await noti.find({
      scheduledAt: { $lte: now },
      sent: false
    });

    for (const noti of notifications) {
      let fcm_tokens_list = [];

      if (noti.sendtoAll) {
        const users = await user.find().lean();
        fcm_tokens_list = users.map(u => u.fcmToken).filter(t => t);
      } else {
        for (const u of noti.userIDlist) {
          const userObj = await User.findOne({ userID: u.userID });
          if (userObj?.fcmToken) fcm_tokens_list.push(userObj.fcmToken);
        }
      }

      if (fcm_tokens_list.length > 0) {
        const payload = {
          notification: { title: noti.title, body: noti.message },
          data: { notificationID: noti.notiID }
        };

        await admin.messaging().sendEachForMulticast({ tokens: fcm_tokens_list, ...payload });
      }

      noti.sent = true;
      await noti.save();
      console.log(`Đã gửi thông báo ${noti.notiID}`);
    }
  } catch (err) {
    console.error('Lỗi khi gửi thông báo theo lịch:', err.message);
  }
})

router.get('/list-all', async (req, res) => {
    try {
        const notifications = await noti.find().sort({ createdAt: -1 });
        res.json({ status: "Success", message: "Lấy danh sách tất cả thông báo thành công", data: notifications });
    }
    catch (err) {
        res.json({ status: "Failed", message: "Lấy danh sách tất cả thông báo thất bại", data: err });
    }
})

module.exports = router
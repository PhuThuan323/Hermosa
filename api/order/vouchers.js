const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const voucher = require('../../models/voucher')
const voucherUsage = require('../../models/voucherUsage')
const order = require('../../models/order')
const cart = require('../../models/cart')
dotenv.config();
//---------------------TẠO VOUCHER MỚI-----------------------
router.post('/create', async (req,res)=>{
    try{
        const{
            description,
            discountType,
            discountValue,
            minPurchaseAmount,  
            validFrom,
            validTo,
            usageLimit,
            applicableProducts
        } = req.body
        const voucherCode = 'V'+ Math.random().toString(36).substring(2,8).toUpperCase()
        const newVocuher = new voucher({
            voucherCode,
            description,
            discountType,
            discountValue,
            minPurchaseAmount,  
            validFrom,
            validTo,
            usageLimit,
            applicableProducts,
            createdAt: Date.now(),
            totalOfUsage: 0
        })
        await newVocuher.save()
        res.status(201).json({message: 'Tạo voucher thành công', data: newVocuher})
    }
    catch(err){
        res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
//Xóa vouher  (Admin)
router.delete('/delete', async (req,res)=>{
    try{
        const {voucherCode} = req.body
        const result = await voucher.deleteOne({voucherCode})
        return res.status(200).json({message:"Xóa voucher thành công"})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
//Thống kê số lượt sử dụng của tất cả voucher
router.get('/total-of-usage', async (req,res)=>{
    try{
        return res.status(200).json({message: 'Thống kê số lượt sử dụng voucher thành công', 
            data: await voucher.find({}, {voucherCode:1, totalOfUsage:1, _id:0})} )
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})

//Lấy những voucher khả dụng ứng với đơn hàng hiện tại của người dùng
router.post('/suggestion', async (req, res) => {
    try {
        const {userID} = req.body;
        const fCart = await cart.findOne({userID});
        const now = Date.now();
        const money = fCart.totalMoney;
        let fUser = await voucherUsage.findOne({userID});
        if(!fUser){
            fUser = await voucherUsage.create({
                userID,
                voucherUse: []
            });
        }
        const available = await voucher.find({
            validFrom: {$lte: now},
            validTo: {$gte: now},
            minPurchaseAmount: {$lte: money}
        }).lean();
        const usableVoucher = [];
        for (let i of available) {
            const usageList = fUser?.voucherUse || [];
            const fUsage = usageList.find(v => String(v.voucherCode).trim() === String(i.voucherCode).trim());
            const useTotal = fUsage?.sumofUse ?? 0
            const maxUsage = i.usageLimit
            if (useTotal < maxUsage) {
                usableVoucher.push(i);
            }
        }

        return res.status(200).json({ message: "Lấy voucher khả dụng thành công", data: usableVoucher });

    } catch (err) {
        return res.status(500).json({
            message: 'Không thể lấy danh sách voucher khả dụng cho người dùng',
            details: err.message
        });
    }
});

//Xem chi tiết một voucher
router.get('/detail', async (req,res)=>{
    try{
        const { voucherCode } = req.query
        const fVoucher = await voucher.findOne({ voucherCode })
        return res.status(200).json({message: "Lấy dữ liệu voucher thành công", data: fVoucher})
    }
    catch(err){
        return res.status(500).json({message: "Lỗi hệ thống", details: err.message})
    }
})

//Áp dụng một voucher (voucher này trong mớ suggest đã được suggest trước đó) 
router.put('/apply', async (req,res)=>{
    try{
        const {voucherCode, orderID} = req.body
        const fVoucher = await voucher.findOne({voucherCode})
        let fOrder = await order.findOne({orderID})
        let discountAmount = 0
        if(fVoucher.discountType === 'percentage'){
            discountAmount = fOrder.totalInvoice * (fVoucher.discountValue / 100)
        }
        else if(fVoucher.discountType === 'fixed'){
            discountAmount = fVoucher.discountValue
        }
        
        fOrder = await order.findOneAndUpdate(
            { orderID: fOrder.orderID },
            { $set: 
                { 
                    voucherCodeApply: voucherCode,
                    discountAmount: discountAmount
                } 
            }, 
            { new: true } 
        )
        fOrder.finalTotal = fOrder.totalInvoice - fOrder.discountAmount + fOrder.deliveryFee + fOrder.tipsforDriver
        await fOrder.save()
        return res.status(200).json({message: "Áp dụng voucher thành công", data: fOrder})
    }
    catch(err){
        return res.status(500).json({message: "Không thế áp dụng voucher", details: err.message})
    }
})

//Xác nhận sử dụng voucher (khi đơn hàng hoàn tất)
router.put('/confirm-use', async (req,res)=>{
    try{
        const { voucherCode, orderID } = req.body
        const fOrder = await order.findOne({orderID})
        const fVoucher = await voucher.findOne({voucherCode})
        let user = fOrder.userID
        //Cập nhật nngười dùng đã sử dụng voucher nếu như họ đã thanh toán thành công
        //Nếu không thanh toán thành công thì chưa update
        if(fOrder.paymentStatus === "done"){
            const fUserUsage = await voucherUsage.findOne({userID: user})
            if(!fUserUsage){
                const newUsage = new voucherUsage({
                    userID: user,
                    voucherUse: { voucherCode, useAt: Date.now() },
                    sumofUse: sumofUse + 1
                })
                await newUsage.save()
            }
            else if(fUserUsage){
                fUserUsage.voucherUse.push({voucherCode, usedAt: Date.now()})
            }
            //Cập nhật tổng số lượt sử dụng voucher
            fVoucher.totalOfUsage += 1
            await fVoucher.save()
            res.status(200).json({message: "Xác nhận sử dụng voucher thành công", data: fUserUsage})
        }
        else{
            return res.status(400).json({message: "Đơn hàng chưa được thanh toán, không thể xác nhận sử dụng voucher"})
        }
    }
    catch(err){
        return res.status(500).json({message: "Không thể cập nhật lượt sử dụng voucher", details: err.message})
    }
})


//Liệt kê tất cả voucher đang trong thời gian khả dụng
router.get('/available-admin', async (req,res)=>{
    try{
        const now = new Date()
        const availableVouchers = await voucher.find({validFrom: {$lte: now}, validTo: {$gte: now}})
        return res.status(200).json({message: 'Lấy danh sách voucher khả dụng thành công', data: availableVouchers})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
router.get('/available-user', async (req,res)=>{
    try{
        const {userID} = req.query 
        let now = new Date();
        const availableVouchers = await voucher.find({validFrom: {$lte: now}, validTo: {$gte: now}}).lean()
        let fUser = await voucherUsage.findOne({userID});
        if (availableVouchers.length === 0) {
            return res.status(200).json({
                message: "Hiện tại không có voucher phù hợp",
                bestVoucher: null,
                discountAmount: 0
            });
        }
        const usableVoucher = [];

        for (let v of availableVouchers) {
            const usageList = fUser.voucherUse || [];
            const usage = usageList.find(u => String(u.voucherCode).trim() === String(v.voucherCode).trim());
            const usedCount = usage?.sumofUse ?? 0;
            if (usedCount < v.usageLimit) {
                usableVoucher.push(v);
            }
        }
        
        if (usableVoucher.length === 0) {
            return res.status(200).json({message: "Tất cả voucher đã dùng hết lượt"});
        }
        return res.status(200).json({message: `Lấy danh sách voucher khả dụng cho user ${userID} thành công`, data: availableVouchers})
    }
    catch(err){
        return res.status(500).json({message: 'Lấy danh sách voucher khả dụng cho user thất bại', details: err.message})
    }
})
//Liệt kê tất cả các voucher đã hết hạn sử dụng
router.get('/expired', async (req,res)=>{
    try{
        const now  =  new Date()
        const expiredVocuhers = await voucher.find({validTo: {$lte: now}})
        return res.status(200).json({message: 'Lấy danh sách voucher đã hết hạn thành công', data: expiredVocuhers})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
//Cập nhật voucher 
router.put('/update', async (req,res)=>{
    try{
        const { voucherCode, description,discountType,discountValue,
            minPurchaseAmount,validFrom,validTo, usageLimit} = req.body
        const  fVoucher = await voucher.findOne({voucherCode})
        if(!fVoucher){
            return res.status(404).json({message: 'Voucher không tồn tại'}) 
        }
        fVoucher.description = description
        fVoucher.discountType = discountType
        fVoucher.discountValue = discountValue 
        fVoucher.minPurchaseAmount = minPurchaseAmount
        fVoucher.validFrom = validFrom
        fVoucher.validTo = validTo
        fVoucher.usageLimit = usageLimit
        await fVoucher.save()
        return res.status(200).json({message: 'Cập nhật voucher thành công', data: fVoucher})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
// Liệt kê tất cả voucher đã được người dùng sử dụng
router.get('/list-all-used-voucher', async (req, res) => {
    try {
        const { userID } = req.query;
        const fUser = await voucherUsage.findOne({ userID });
        if (!fUser || fUser.voucherUse.length === 0) {
            return res.status(200).json({
                message: `User ${userID} chưa sử dụng voucher nào`,
                data: []
            });
        }
        return res.status(200).json({
            message: `Lấy danh sách voucher đã sử dụng của user ${userID} thành công`,
            data: fUser.voucherUse 
        });

    } catch (err) {
        return res.status(500).json({ message: `Lấy danh sách voucher đã sử dụng của user ${userID} thất bại`, details: err.message});
    }
});

//Tái hoạt động một voucher đã hết hạn
router.put('/re-active', async (req, res) => {
    try {
        const { voucherCode, newValidFrom, newValidTo } = req.body;
        if (!voucherCode || !newValidFrom || !newValidTo) {
            return res.status(400).json({ message: "Thiếu dữ liệu gửi lên" });
        }
        const result = await voucher.findOne({ voucherCode });
        if (!result) {
            return res.status(404).json({ message: "Voucher không tồn tại" });
        }
        // Ép kiểu Date
        const fromDate = new Date(newValidFrom);
        const toDate = new Date(newValidTo);

        if (fromDate >= toDate) {
            return res.status(400).json({ message: "Ngày bắt đầu phải trước ngày kết thúc" });
        }
        // Cập nhật
        result.validFrom = fromDate;
        result.validTo = toDate;
        await result.save();
        return res.status(200).json({
            message: "Tái hoạt động voucher thành công",
            data: result
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Không thể cập nhật lại voucher',
            details: err.message 
        });
    }
});


module.exports = router
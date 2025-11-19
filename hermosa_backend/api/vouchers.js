const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const voucher = require('../models/voucher')
const voucherUsage = require('../models/voucherUsage')
const order = require('../models/order')
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
router.get('total-of-usage', async (req,res)=>{
    try{
        return res.status(200).json({message: 'Thống kê số lượt sử dụng voucher thành công', 
            data: await voucher.find({}, {voucherCode:1, totalOfUsage:1, _id:0})} )
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})

//Lấy những voucher kahr dụng ứng với từng người dùng 
router.post('/apply', async (req,res)=>{
    try{
        const {cartTotal, userID} = req.body
        const now = new Date()
        const usedVouchers = await voucherUsage.find({userID}).distinct('voucherCode')
        const fVoucher = await voucher.find({validFrom: {$lte: now}, validTo: {$gte: now},
             minPurchaseAmount: {$lte: cartTotal}, usageLimit: {$gte: usedVouchers}})
        return res.status(200).json({message: 'Lấy voucher có thể áp dụng thành công', data: fVoucher}  )
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
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
//Áp dụng voucher bất kỳ (Bổ sung vào api đã thanh toán)
router.put('/apply', async (req,res)=>{
    try{
        const {voucherCode, orderID, userID} = req.body
        const fVoucher = await voucher.findOne({voucherCode})
        if(!fVoucher){
            return res.status(404).json({message: 'Voucher không tồn tại'})
        }
        const fOrder = await order.findOne({orderID})
        if(!fOrder){
            return res.status(404).json({message: 'Đơn hàng không tồn tại'})
        }
        //Cập nhật tổng hóa đơn sau khi áp dụng voucher
        let discountAmount = 0
        if(fVoucher.discountType === 'percentage'){
            discountAmount = fOrder.totalInvoice * (fVoucher.discountValue / 100)
        }
        else if(fVoucher.discountType === 'fixed'){
            discountAmount = fVoucher.discountValue
        }
        fOrder.totalInvoiceAfterVoucher = fOrder.totalInvoice - discountAmount
        await fOrder.save()
        //Ghi nhận việc sử dụng voucher
        const fUserUsage = await findOne({userID})
        if(!fUserUsage){
            const newUsage = new voucherUsage({
                userID,
                voucherUse: { voucherCode, useAt: Date.now() }
            })
            await newUsage.save()
        }
        else if(fUserUsage){
            fUserUsage.voucherUse.push({voucherCode, usedAt: Date.now()})
        }
        //Cập nhật tổng số lượt sử dụng voucher
        fVoucher.totalOfUsage += 1
        await fVoucher.save()
    }
    catch(err){
        res.status(500).json({message: "Lỗi hệ thống", details: err.message})
    }
})

//Tự động áp dụng voucher khi người dùng vừa khởi tạo đơn hàng xong, voucher có lợi nhất cho người dùng 
router.put('/auto-apply', async (req,res)=>{
    try{
        const { orderID } = req.body
        const now = new Date()
        const fOrder = await order.findOne({orderID})
        const available = await voucher.find({validTo: {$lte: now}, validfrom: {$gte: now}})
        if (available.length === 0) {
            return res.status(200).json({
                message: "Không có voucher phù hợp",
                bestVoucher: null,
                discountAmount: 0
            });
        }
        let bestVoucher = null;
        let maxDiscount = 0;
        available.forEach(v => {
            let discount = 0;

            if (v.discountType === "percentage") {
                discount = fOrder.totalInvoice * (v.discountValue / 100);
            } else if (v.discountType === "fixed") {
                discount = v.discountValue;
            }
            if (discount > maxDiscount) {
                maxDiscount = discount;
                bestVoucher = v;
            }
        });
        if (!bestVoucher) {
            return res.json({
                message: "Không tìm được voucher có lợi",
                bestVoucher: null,
                discountAmount: 0
            });
        }
        fOrder.totalInvoiceAfterVoucher = fOrder.totalInvoice - maxDiscount;
        await fOrder.save()
         res.json({
            message: "Đã tự động áp dụng voucher tốt nhất",
            bestVoucher,
            discountAmount: maxDiscount,
            newTotal: fOrder.totalInvoiceAfterVoucher
        });
    }
    catch(err){
         return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
//Liệt kê tất cả voucher đang trong thời gian khả dụng
router.get('/available', async (req,res)=>{
    try{
        const now = new Date()
        const availableVouchers = await voucher.find({validFrom: {$gte: now}, validTo: {$lte: now}})
        return res.status(200).json({message: 'Lấy danh sách voucher khả dụng thành công', data: availableVouchers})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
//Liệt kê tất cả các voucher đã hết hạn sử dụng
router.get('/expired', async (req,res)=>{
    try{
        const now  =  new Date()
        const expiredVocuhers = await voucher.find({validTo: {$lt: now}})
        return res.status(200).json({message: 'Lấy danh sách voucher đã hết hạn thành công', data: expiredVocuhers})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
//Cập nhật tình trạng voucher 
router.put('/update', async (req,res)=>{
    try{
        const {voucherCode} = req.query
        const {description,discountType,discountValue,
            minPurchaseAmount,validFrom,validTo, usageLimit,applicableProducts} = req.body
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
        fVoucher.applicableProducts = applicableProducts
        await fVoucher.save()
        return res.status(200).json({message: 'Cập nhật voucher thành công', data: fVoucher})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message})
    }
})
//Liệt kê tất cả voucher đẫ được người dùng sử dụng
router.get('/list-all-used-voucher', async (req,res)=>{
    try{
        const { userID } = req.body
        const fUser = voucherUsage.findOne({userID})
        return res.status(200).json({message: "Lấy danh sách voucher đã sử dụng thành công", data: fUser.voucherUse })
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message })
    }
})
//Tái hoạt động một voucher đã hết hạng 
router.put('/reapply', async (req, res)=>{
    try{
        const { voucherCode, newValidFrom, newValidTo } = req.body
        const fVoucher = await voucher.findByIdAndUpdate({voucherCode, validfrom: newValidFrom, validTo: newValidTo })
        return res.status(200).json({message: "Tái hoạt động một voucher đã hết hạn thành công", data: fVoucher})
    }
    catch(err){
        return res.status(500).json({message: 'Lỗi hệ thống', details: err.message })
    }
})

module.exports = router
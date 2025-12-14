const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const topping = require('../models/topping')
dotenv.config();
//----------------Thêm topping vào--------------
router.post('/add', async (req, res)=>{
    try{
        let {name, price} = req.body 
        let nextNumber = 1; 
        const lastProduct = await topping.findOne().sort({toppingID:-1})
        
        if(lastProduct&&lastProduct.toppingID){
            const num = parseInt(lastProduct.toppingID.substring(1))
            nextNumber = num+1
        }
        const toppingID = `T${String(nextNumber).padStart(2,'0')}`
        const newTopping = new topping({
            name,
            price,
            toppingID,
            out_of_service: false
        })
        const result = await newTopping.save()
        res.status(201).json({status: "Success", message: "Thêm topping thành công", data: result})
    }
    catch(err){
        res.status(500).json({status: "Failed", message: "Lỗi hệ thống: " + err.message})
    }
})
//Xóa topping ra khỏi menu 
router.delete('/delete', async (req,res)=>{
    try{
        let {toppingID} =  req.body
        const deleteProduct = await topping.deleteOne(toppingID)
        res.status(200).json({status: "Success", message:"Xóa sản phẩm thành công"})
    }
    catch(err){
        res.status(500).json({status: "Failed", message: "Lỗi hệ thống" + err.message})
    }  
})

//Thay đổi trạng thái còn hàng của topping 
router.put('/change-status', async (req,res)=>{
    try{
        const {toppingID, out_of_service} = req.body
        const findTop = topping.findOne({toppingID})
        if(findTop){
            findTop.out_of_service = out_of_service
            await findTop.save()
            return res.status(200).json({status:"Success", message:"Cập nhật tình trạng topping thành công"})
        }
        else{
            return res.status(400).json({message: "Không thể tìm thấy topping tương tự"})
        }
    }
    catch(err){
        res.status(500).json({status: "Failed", message: "Lỗi hệ thống" + err.message})
    }
})

//-------------Chỉnh sửa thông tin topping----------------
router.put('/change-topping-detail', async(req,res)=>{
    const {toppingID, name,price} = req.body
    const findTop = topping.findOne({toppingID})
    findTop.name = name
    findTop.price = price
    await findTop.save()
})

module.exports = router

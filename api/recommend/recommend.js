const router = require('express').Router();
const axios = require('axios'); 
const { logEvent } = require('../../logging/eventLogger'); 
const user = require('../../models/user')
//Gợi ý sản phẩm mà người dùng khác cũng mua/xem/thêm vào giỏ hàng dựa trên sản phẩm mà người dùng đã thêm vào giỏ hàng
router.get('/alsoLike', async(req,res)=>{
    const { userID } = req.query
    const visitorID = userID
    try{
        // console.log(`🔎 Yêu cầu gợi ý cho Visitor: ${visitorID}`);
        // console.log(`${process.env.PYTHON_SERVICE_URL}recommend/also_liked/${visitorID}`)
        const response = await axios.get(`${process.env.PYTHON_SERVICE_URL}recommend/also_liked/${visitorID}`)
        
        res.json({ status: "Success", message: "Gợi ý cá nhân hóa thành công", data: response.data });
    }
    catch(err){
        console.error("Lỗi gọi Python Service:", err.message);
        res.status(500).json({ status: "Failed", message: "Không thể lấy gợi ý từ server" });
    }
})

router.get('/alsoView', async(req,res)=>{
    const { userID } = req.query
    const visitorID = userID
    try{
        // console.log(`🔎 Yêu cầu gợi ý cho Visitor: ${visitorID}`);
        // console.log(`${process.env.PYTHON_SERVICE_URL}recommend/also_viewed/${visitorID}`)
        const response = await axios.get(`${process.env.PYTHON_SERVICE_URL}recommend/also_viewed/${visitorID}`)
        res.json({ status: "Success", message: "Gợi ý cá nhân hóa thành công", data: response.data });
    }
    catch(err){
        // console.error("Lỗi gọi Python Service:", err.message);
        res.status(500).json({ status: "Failed", message: "Không thể lấy gợi ý từ server" });
    }
})

router.get('/next-item-prediction', async(req,res)=>{
    const {productID} = req.query
    try{
        console.log(`${process.env.PYTHON_SERVICE_URL}recommend/upsell-item/${productID}`)
        const response = await axios.get(`${process.env.PYTHON_SERVICE_URL}recommend/upsell-item/${productID}`)
        res.json({status: "Success", message: "Gợi ý các món upsell thành công", data: response.data})
    }
    catch(err){
        console.error("Lỗi gọi Python Service:", err.message);
        res.status(500).json({status: "Failed", message: "Không thể lấy gợi ý upsell từ server"})
    }
})
module.exports = router;
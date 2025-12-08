const router = require('express').Router();
const axios = require('axios'); 
const { logEvent } = require('../../logging/eventLogger'); 
const user = require('../../models/user')
//Gợi ý sản phẩm mà người dùng khác cũng mua/xem/thêm vào giỏ hàng dựa trên sản phẩm mà người dùng đã thêm vào giỏ hàng
router.get('/recommendations', async(req,res)=>{
    const visitorID = req.session?.id || req.query.visitor_id || 'ANONYMOUS_USER'; 
    if (visitorID === 'ANONYMOUS_USER') {
         return res.json({ status: "Success", message: "Chưa xác định được người dùng, trả về gợi ý chung." });
    }

    try{
        console.log(`🔎 Yêu cầu gợi ý cho Visitor: ${visitorID}`);
        const response = await axios.get(`${PYTHON_SERVICE_URL}/api/v1/recommend/${visitorID}`)
        res.json({ status: "Success", message: "Gợi ý cá nhân hóa thành công", data: response.data.recommendations });
    }
    catch(err){
        console.error("Lỗi gọi Python Service:", err.message);
        res.status(500).json({ status: "Failed", message: "Không thể lấy gợi ý từ backend." });
    }
});

router.get('/all-user', async (req,res)=>{
    const findall = await user.find().lean()
    let users = []
    for(let i of findall){
        users.push(i._id)
    }
    return res.status(200).json(users)
})

module.exports = router;
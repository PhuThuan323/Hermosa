const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cart = require('../models/cart')
const menu = require('../models/menu')
const order = require('../models/order')
const user = require('../models/user')
dotenv.config();

async function SumOfProduct(UID) {
  let total = 0
  const detailedItems = []
  const findUSer = await cart.findOne({userID: UID})
  const ID = findUSer.items.map(item => item.productID)
  const products = await menu.find({productID: {$in: ID}})
  
    for(const m of findUSer.items){
      const product = products.find(p=> p.productID === m.productID)
      if(product){
        const subtotal = product.price *m.quantity
        total += subtotal
        detailedItems.push({
          name: product.name,
          productID: product.productID,
          price: product.price,
          quantity: m.quantity,
          subtotal
        })
      }
    }
    findUSer.totalMoney = total
    await findUSer.save()
    return {total, detailedItems}
}
//---------------------------TAO DON HANG MOI------------------
router.post('/create', async (req,res)=>{
    try{
    let {userID,paymentMethod, paymentStatus, deliver, deliverAddress, note} = req.body
    const userCart = await cart.findOne({userID})
    if(userCart.items.length === 0){
        return res.json({status:"Failed", message:"Cart is empty"})
    }
    const {total,detailedItems}=await SumOfProduct(userID)
    const newOrder = new order({
        orderID: `ORD-${Date.now()}`,
        status: "pending",
        userID,
        totalInvoice: total,
        products: detailedItems,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        deliver: deliver,
        deliverAddress: deliverAddress,
        note: note,
        createAt: Date.now()
    })
    await newOrder.save()
    await cart.updateOne({userID},{$set: {items:[]}})
    res.json({
        status: "Success", message: "Order created successfull", data: newOrder
    })
    }
    catch (err){  
        res.json({status: 'Failed', message: 'Internal server error', detail: err.message,})
    }
})
//-----------------------THAY DOI TRANG THAI DON HANG-----------
router.put('/change-order-status', async (req,res)=>{
    try{
        let {orderID, status} = req.query
        const updated = await order.findOneAndUpdate({ orderID }, { status }, { new: true });
        if(status === "done"){
          await order.findOneAndUpdate({doneIn: Date.now()})
        }
        res.json({status:"Success", message:"Change order status successful", data: updated})
    }
    catch(err){
        res.json({status: 'Failed', message: 'Internal server error', detail: err.message,})
    }
})
//-----------------------HUY DON HANG-----------------------
router.delete('/cancel', async (req,res)=>{
    try{
        let {orderID} = req.body
        const findOrder = await order.findOne({orderID})
        if(findOrder.status != "pending"){
            return res.json({status:"Fail", "message": "Cannot cancel after confirm from staff, contact to admin"})
        }
        await order.findOneAndDelete({orderID})
        res.json({status:"Success", "message": "Cancel order successful"})
    }
    catch(err){
        res.json({status: 'Failed', message: 'Internal server error', detail: err.message,})
    }
})

//------------------Xem chi tiết đơn hàng--------------------------
router.get('/view', async (req,res)=>{
    try{
        let {orderID} = req.query
        const findOrder = await order.findOne({orderID})
        res.json({status: "Success", message:"View order successful", data: findOrder})
    }
    catch(err){
        res.json({status: 'Failed', message: 'Internal server error', detail: err.message,})
    }
})
//-----------------Xem tất cả danh sách đơn hàng------------------
router.get('/view-all', async (req,res)=>{
    try{
        const order_all = await order.find()
        res.json({status: "Success", message:"List all successful", data: order_all})
    }
    catch(err){
        res.json({status: 'Failed', message: 'Internal server error', detail: err.message,})
    }
})
//-----------------Xem danh sach don hang theo ngay thang---------
router.get('/list', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate ? new Date(endDate) : new Date()

    // Chỉnh timezone cho Việt Nam (UTC+7)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    const orders = await order.find({
      createAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 })

    res.json({
      status: 'Success',
      message: `Danh sách đơn hàng từ ${startDate} đến ${endDate}`,
      count: orders.length,
      data: orders
    })
  } catch (err) {
    res.json({
      status: 'Failed', message: 'Cannot get list of product', detail: err.message
    })
  }
})

//-----------------Xem lich su mua hang cua khach hang-------------

router.get('/order-history', async(req,res)=>{
    try{
        let {userID} = req.query
        const history = order.findOne({userID})
        res.json({status:"Success", message:"List user order history successfull", data: history})
    }
    catch(err){
        res.json({
            status: 'Failed', message: 'Cannot get list of product', detail: err.message
        })
    }
})

async function check_already_review(UID, OID, PID) {
  const findOrder = await order.findOne({ orderID: OID });
  if (!findOrder) return false;
  const alreadyReviewed = findOrder.reviewofProduct.some(
    (review) =>
      review.userID?.toString() === UID.toString() &&
      review.productID === PID
  );
  return alreadyReviewed;
}
//-----------------Danh gia don hang va tung san pham trong don hang---------------
router.post('/review-order-and-products', async (req, res) => {
  try {
    let { orderID } = req.query
    let { productsReview, orderReview } = req.body
    const fOrder = await order.findOne({orderID})
    const fUser = await user.findOne({userID: fOrder.userID})

    if (!fOrder) return res.json({ status: "Failed", message: "Order not found" });

    if (fOrder.status !== "done") {
      return res.json({ status: "Failed", message: "You cannot review the order!" });
    }

    fOrder.reviewofOrder = orderReview
    for (const item of productsReview) {
      const p = item.productID
      const r = item.rating
      const c = item.comment
      const already = await check_already_review(fOrder.userID, orderID, productID);
      //Nếu như đã có đánh giá trước đó thì bỏ qua đánh giá cho sản phẩm này
      if (already) {
        continue;
      }
      const fProduct = await menu.findOne({ productID: p })
      
      fOrder.reviewofProduct.push({productID: p, productName: fProduct.name,rating: r, comment: c})

      fProduct.sumofReviews.push({
        userID: fOrder.userID,
        name: fUser.name,
        picture: fUser.avatar,
        rating: r,
        comment: c,
        date: new Date(),
      })
      if (fProduct.sumofReviews.length > 0) {
        const totalRatings = fProduct.sumofReviews.reduce((sum, rev) => sum + rev.rating, 0);
        fProduct.sumofRatings = totalRatings / fProduct.sumofReviews.length;
      } else {
        fProduct.sumofRatings = r;
      }
      await fProduct.save()
    }
    await fOrder.save()
    res.json({status: "Success",message: "Review for order saving successful",orderID: fOrder.orderID, reviewOder: fOrder.reviewofOrder, reviewProduct: fOrder.reviewofProduct })
  } catch (err) {
    res.json({status: "Failed",message: "Cannot get list of product",detail: err.message,})
  }
});

//--------------Chỉnh sửa đánh giá--------------------
router.put('/change-order-review', async(req,res)=>{
  let {orderID} = req.query
  let {changeOrderReview, changeProductReview} = req.body
  const findOrder = await order.findOne({orderID})
  if(findOrder.status === "done"){
    order.reviewofOrder = changeOrderReview
    for(const pr of changeProductReview){
      const change = await order.findOne({productID: pr.productID})
      if(!change){
        continue
      }
      
    }
  }
})
//---------------Xóa đánh giá-------------------------

module.exports = router
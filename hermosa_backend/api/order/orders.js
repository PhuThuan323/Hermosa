const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cart = require('../../models/cart')
const menu = require('../../models/menu')
const order = require('../../models/order')
const user = require('../../models/user')
const voucher = require('../../models/voucher')
const voucherUsage = require('../../models/voucherUsage')

dotenv.config();

//---------------------------TAO DON HANG MOI------------------
//Tìm và tự động áp dụng voucher tốt nhất cho đơn hàng khi vừa được tạo ra
async function autoApplyVoucher(fOrder) {
  let findUserID = fOrder.userID
  let fUser = await voucherUsage.findOne({ userID: findUserID })
  if (!fUser) {
    fUser = await voucherUsage.create({
      userID: findUserID,
      voucherUse: []
    })
  }
  const now = new Date();

  // Lấy voucher hợp lệ về thời gian và điều kiện đơn hàng
  const available = await voucher.find({
    validFrom: { $lte: now },
    validTo: { $gte: now },
    minPurchaseAmount: { $lte: fOrder.totalInvoice }
  }).lean()
  if (available.length === 0) {
    return {
      voucherCodeApply: null,
      discountAmount: 0,
      totalInvoiceAfterVoucher: fOrder.totalInvoice
    }
  }

  // Lọc voucher chưa hết lượt
  const usableVoucher = []
  for (let v of available) {
    const usage = (fUser.voucherUse || []).find(
      u => String(u.voucherCode).trim() === String(v.voucherCode).trim()
    )
    const usedCount = usage?.sumofUse ?? 0

    if (usedCount < v.usageLimit) usableVoucher.push(v);
  }

  if (usableVoucher.length === 0) {
    return {
      voucherCodeApply: null,
      discountAmount: 0,
      totalInvoiceAfterVoucher: fOrder.totalInvoice
    }
  }

  // Tìm voucher giảm nhiều nhất
  let bestVoucher = null
  let maxDiscount = 0

  usableVoucher.forEach(v => {
    let discount = 0
    if (v.discountType === "percentage") {
      discount = fOrder.totalInvoice * (v.discountValue / 100)
    } else if (v.discountType === "fixed") {
      discount = v.discountValue
    }
    if (discount > maxDiscount) {
      maxDiscount = discount;
      bestVoucher = v;
    }
  })
  if (!bestVoucher) {
    return {
      voucherCodeApply: null,
      discountAmount: 0,
      totalInvoiceAfterVoucher: fOrder.totalInvoice
    }
  }

  return {
    voucherCodeApply: bestVoucher.voucherCode,
    discountAmount: maxDiscount
  }
}
router.post('/create', async (req,res)=>{
  try{
    let { userID } = req.body
    const userCart = await cart.findOne({ userID })
    const findOrder = await order.findOne({ userID })
    if(findOrder){
        return res.json({status: "Failed", message: "Đã có sẳn một order chưa được hoàn thành, hãy hoàn thành trước khi tạo thêm order khác"})
    }
    let newOrder = new order({
        orderID: `ORD-${Date.now()}`,
        status: "pending",
        userID,
        totalInvoice: userCart.totalMoney,
        finalTotal: userCart.totalMoney,
        products: userCart.items,
        paymentStatus: "not_done",
        createAt: Date.now()
    })
    await newOrder.save()
    
    // Áp dụng voucher tốt nhất
    const voucherResult = await autoApplyVoucher(newOrder)
    newOrder = await order.findOneAndUpdate(
      { orderID: newOrder.orderID },
      { voucherCodeApply: voucherResult.voucherCodeApply,
        discountAmount: voucherResult.discountAmount,
      },
      { new: true }
    )
    await newOrder.save()
    newOrder.finalTotal = Number(newOrder.totalInvoice) - Number(newOrder.discountAmount) + Number(newOrder.deliveryFee) + Number(newOrder.tipsforDriver)
    await newOrder.save()
    res.json({ status: "Success", message: "Tạo đơn hàng thành công", data: newOrder})
  }
  catch (err){  
    res.json({status: 'Failed', message: 'Tạo đơn hàng mới không thành công', detail: err.message})
  }
})


//Xóa đơn hàng, khi người dùng interupt đơn hàng mà không nhấn place order chính thức (thoát giao diện or refresh trang đơn hàng
router.delete('/delete-interrupt-order', async (req,res)=>{
    try{
        let {userID} = req.body
        await order.findOneAndDelete({userID})
        res.json({status: "Success", message: "Xóa đơn hàng gián đoạn thành công"})
    }
    catch(err){
        res.json({status: 'Failed', message: 'Không thể xóa đơn hàng thành công', detail: err.message})
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
        res.json({status: 'Failed', message: 'Internal server error', detail: err.message})
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
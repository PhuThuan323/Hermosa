const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const menu = require('../../models/menu')
const order = require('../../models/order')
const user = require('../../models/user')
const {logEvent} = require('../../logging/eventLogger')
dotenv.config();

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

    fOrder.reviewofOrder = orderReview
    for (const item of productsReview) {
      const p = item.productID
      const r = item.rating
      const c = item.comment
      const already = await check_already_review(fOrder.userID, orderID, p);
      //Nếu như đã có đánh giá trước đó thì bỏ qua đánh giá cho sản phẩm này
      if (already) {
        continue;
      }
      const fProduct = await menu.findOne({ productID: p })
      
      fOrder.reviewofProduct.push({productID: p, productName: fProduct.name,rating: r, comment: c})

      fProduct.sumofReviews.push({
        userID: fOrder.userID,
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
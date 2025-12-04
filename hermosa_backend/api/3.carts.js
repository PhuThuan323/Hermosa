const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cart = require('../models/cart')
const menu = require('../models/menu')
const Topping = require('../models/topping')
dotenv.config();

// async function caculateSumOfProduct(UID) {
//   let total = 0
//   const detailedItems = []
//   const findUSer = await cart.findOne({userID: UID})
//   const ID = findUSer.items.map(item => item.productID)
//   const products = await menu.find({productID: {$in: ID}})
  
//     for(const m of findUSer.items){
//       const product = products.find(p=> p.productID === m.productID)
//       if(product){
//         const subtotal = product.price *m.quantity
//         total += subtotal
//         detailedItems.push({
//           name: product.name,
//           productID: product.productID,
//           price: product.price,
//           quantity: m.quantity,
//           subtotal
//         })
//       }
//     }
//     findUSer.totalMoney = total
//     await findUSer.save()
//     return {total, detailedItems}
// }
async function caculateCart(userID) {
  const findCart = await cart.findOne({userID})
  let total = 0
  if(findCart.items.length === 1){
    total = findCart.items[0].subtotal
  }
  else if(findCart.items.length > 1){
    for(const pr of findCart.items){
      total += pr.subtotal
      console.log()
    }
  }
  return {total}
}

//---------------THEM SAN PHAM VAO GIO------------------
router.post('/add', async (req, res) => {
  try {
    const { userID, productID, quantity, size, topping = [], note } = req.body;
    let userCart = await cart.findOne({ userID });
    let findProduct = await menu.findOne({productID})
    const name = findProduct.name
    const base_cost = findProduct.price

    let sizeSub = 0
    if(size === "medium") sizeSub = 5000
    else if(size === "large") sizeSub = 10000

    let toppingSub = 0
    if(topping.length !==0){
      for(const top of topping){
        const top_price = await Topping.findOne({name: top})
        toppingSub += top_price.price
      }
    }
    const official_cost = (base_cost + sizeSub + toppingSub) * quantity
    
    //Nếu người dùng chưa được tạo giỏ hàng riêng
    if (!userCart) {
      userCart = new cart({
        userID,
        items: [{ productID, name, quantity, size, topping, note, subtotal: official_cost}],
        totalMoney: official_cost
      });
      await userCart.save();
    //Nếu người dùng đã được taoj giỏ hàng riêng rồi
    } else {
    
      const existedItem = userCart.items.find(
        (item) => item.productID === productID && size === item.size 
        && JSON.stringify(topping.sort()) === JSON.stringify(item.topping.sort())
      );
      //Nếu item được thêm vào chưa có trong giỏ hàng 
      if (!existedItem) {
        userCart.items.push({ productID, name, quantity, size, topping, note, subtotal: official_cost });
        await userCart.save();
      }
      //Nếu item đã có trong giỏ hàng thì tăng số lượng lên rồi tính lại tiền subtotal trong giỏ hàng 
      else {
        existedItem.quantity += quantity
        existedItem.subtotal += official_cost
        await userCart.save();
      }
    }
    const tong = await caculateCart(userID)
    userCart.totalMoney = tong.total
    await userCart.save();
    //tính tổng tiền 
    return res.status(200).json({
      status: 'Success',
      message: 'Add product successful',
      cart: userCart
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.json({
      status: 'Failed',
      message: 'Internal server error',
      detail: err.message,
    });
  }
});

//------------------------TANG SO LUONG SAM PHAM TRONG GIO HANG--------------
router.put('/update-increase', async (req, res)=>{
  try{
    let{userID, itemID} = req.body
    const foundCart = await cart.findOne({userID})
    for(const pr of foundCart.items){
      if(pr._id.toString() === itemID){
        const add = pr.subtotal/pr.quantity
        pr.quantity +=1
        pr.subtotal = add * pr.quantity
      }
    }
    await foundCart.save() 
    const {total} = await caculateCart(userID)
    foundCart.totalMoney = total
    await foundCart.save() 
    res.json({status: "Success", message: "Tăng số lượng sản phẩm thành công"})
  }
  catch(err){ res.json({status: 'Failed', message: 'Lỗi hệ thống', detail: err.message,})
  }
})
//------------------------GIAM SO LUONG SAM PHAM TRONG GIO HANG--------------
router.put('/update-decrease', async (req,res)=>{
  try{
    let{userID, itemID} = req.body
    const foundCart = await cart.findOne({userID})
    for(const pr of foundCart.items){
      if(pr._id.toString() === itemID){
        const add = pr.subtotal/pr.quantity
        pr.quantity -= 1
        pr.subtotal = add * pr.quantity
      }
    }
    await foundCart.save() 
    const {total} = await caculateCart(userID)
    foundCart.totalMoney = total
    await foundCart.save()
    res.json({status: "Success", message: "Giảm số lượng sản phẩm thành công"})
  }
  catch(err){ res.json({status: 'Failed', message: 'Internal server error', detail: err.message,}) }
})

//--------------XOA SAN PHAM KHOI GIO------------------------
router.delete('/delete', async (req,res)=>{
  try{
    let {userID, itemID} = req.body
    const foundUser = await cart.findOne({userID})
    const foundIndex = foundUser.items.findIndex(item => item._id.toString() === itemID)
    if(foundIndex != -1){
      foundUser.items.splice(foundIndex,1)
      await foundUser.save()
      const {total} = await caculateCart(userID)
      foundUser.totalMoney = total
      await foundUser.save()
      return res.json({status: "Success", message: "Xóa sản phẩm thành công", total: total})
    }
    else{
      return res.json({status: "Failed", message: "Không thể tìm thấy sản phẩm"})
    }
  }
  catch(err){
    res.json({status: 'Failed', message: 'Internal server error', detail: err.message,})
  }
})
//--------------------------XOA TOAN BO SAN PHAM KHOI GIO----------------
router.delete('/delete-all', async (req,res)=>{
  try{
    let {userID} = req.query
    const foundcart = await cart.findOne({userID})
    foundcart.items = []
    await foundcart.save()
    return res.json({status: "Success", message: "Xóa tất cả sản phẩm thành công", total: 0})
  }
  catch(err){
    res.json({status: 'Failed', message: 'Lỗi hệ thống', detail: err.message,})
  }
})
//------------------------- XEM TOAN BO GIO HANG, TINH TONG TIEN ---------------

router.get('/view-and-caculate-total-money', async (req,res)=>{
  try{
    let {userID} = req.query
    const foundcart = await cart.findOne({userID}) 
    res.json({
      status: "Success",
      message: "View cart successfull",
      data: foundcart
    })
    
  }
  catch (err) {
    res.json({status: 'Failed', message: 'Lỗi hệ thống', detail: err.message,})
  }
})

module.exports = router

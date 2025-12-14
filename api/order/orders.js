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
const {logEvent} = require('../../logging/eventLogger')
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
router.post('/create', async (req, res) => {
    try {
        const { userID } = req.body;
        const userCart = await cart.findOne({ userID }).lean();

        if (!userCart || userCart.items.length === 0) {
            return res.json({ status: "Failed", message: "Giỏ hàng rỗng, không thể tạo đơn hàng" });
        }
        
        const existingPendingOrder = await order.findOne({ 
            userID, 
            status: { $in: ["pending"] } 
        });

        if (existingPendingOrder) {
            return res.json({
                status: "Failed", 
                message: "Đã có sẵn một order chưa được hoàn thành, hãy hoàn thành trước khi tạo thêm order khác"
            });
        }
        let newOrder = new order({
            orderID: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Thêm random để giảm nguy cơ trùng lặp
            status: "pending",
            userID,
            totalInvoice: userCart.totalMoney,
            finalTotal: userCart.totalMoney, 
            products: userCart.items,
            paymentStatus: "not_done",
            createAt: Date.now()
        });
        const voucherResult = await autoApplyVoucher(newOrder); 
        
        newOrder.voucherCodeApply = voucherResult.voucherCodeApply || null;
        newOrder.discountAmount = voucherResult.discountAmount || 0;
        
        const deliveryFee = newOrder.deliveryFee || 0; 
        const tipsforDriver = newOrder.tipsforDriver || 0;

        newOrder.finalTotal = (
            Number(newOrder.totalInvoice) - 
            Number(newOrder.discountAmount) + 
            Number(deliveryFee) + 
            Number(tipsforDriver)
        );

        const visitorID = userID; 
        for (let item of newOrder.products) {
            logEvent(visitorID, item.productID, 'buy'); 
        }
        await newOrder.save();
        await cart.deleteOne({ userID }); 
        res.json({ status: "Success", message: "Tạo đơn hàng thành công", data: newOrder });
    } catch (err) {
        console.error("Lỗi khi tạo đơn hàng:", err);
        res.status(500).json({ status: 'Failed', message: 'Tạo đơn hàng mới không thành công', detail: err.message });
    }
});

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
        let { orderID, status } = req.query
        const updated = await order.findOneAndUpdate(
          { orderID }, 
          { 
            status,
          }, 
          { new: true }
        );
        if(status === "done"){
          await order.findOneAndUpdate({paymentStatus: "done",doneIn: Date.now()})
        }
        res.json({status:"Success", message:"Xác nhận đã thanh toán tiền mặt thành công", data: updated})
    }
    catch(err){
        res.json({status: 'Failed', message: 'Lỗi hệ thống', detail: err.message})
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
router.get('/view', async (req, res) => {
    try {
        const { orderID } = req.query
        const findOrder = await order.findOne({ orderID }).lean()
        if (!findOrder) {
            return res.status(404).json({
                status: "Failed",
                message: "Không tìm thấy order với mã đơn hàng tương ứng"
            })
        }
        return res.status(200).json({
            status: "Success",
            message: "Xem đơn hàng thành công",
            data: findOrder
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            status: "Failed",
            message: "Xem đơn hàng không thành công"
        })
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

router.get('/order-history', async (req, res) => {
    try {
        const { userID } = req.query;
        const orders = await order.find({ userID }).lean();

        if (orders.length === 0) {
            return res.json({
                status: "Success",
                message: "Người dùng chưa có lịch sử đơn hàng",
                data: []
            });
        }

        const result = await Promise.all(
            orders.map(async (ord) => {
                const productIDs = ord.products.map(p => p.productID);
                const pictures = await menu.find({
                    productID: { $in: productIDs }
                }).lean();

                return {
                    orderInfo: ord,
                    products: ord.products,
                    pictures: pictures
                };
            })
        );

        return res.json({
            status: "Success",
            message: "Lấy lịch sử đơn hàng với hình ảnh sản phẩm thành công",
            data: result
        });

    } catch (err) {
        res.json({
            status: 'Failed',
            message: 'Không thể lấy lịch sử đơn hàng',
            detail: err.message
        });
    }
});




module.exports = router
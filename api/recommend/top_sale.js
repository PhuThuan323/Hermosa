const router = require('express').Router()
const order = require('../../models/order')
const menu = require('../../models/menu')
router.get('/top-selling', async (req, res) => {
  try {
    // Chỉ lấy các đơn hàng đã hoàn thành (done) để tính bán chạy thực tế
    const completedOrders = await order.find({ status: "done" }).lean();

    const productCount = {};

    // Đếm số lượng bán ra theo productID
    completedOrders.forEach(ord => {
      ord.products.forEach(p => {
        const productID = p.productID;
        const quantity = p.quantity || 1;

        if (!productCount[productID]) {
          productCount[productID] = 0;
        }
        productCount[productID] += quantity;
      });
    });

    // Chuyển thành mảng và lấy top 5
    const topList = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1]) // Sắp xếp giảm dần theo số lượng
      .slice(0, 5)
      .map(([productID, totalSold]) => ({ productID, totalSold }));

    if (topList.length === 0) {
      return res.json({
        status: "Success",
        message: "Chưa có đơn hàng nào hoàn thành",
        data: []
      });
    }

    // Lấy thông tin chi tiết sản phẩm từ menu
    const productIDs = topList.map(item => item.productID);
    const menuItems = await menu.find({ productID: { $in: productIDs } }).lean();

    // Gộp dữ liệu: thông tin menu + số lượng bán
    const result = topList.map(top => {
      const menuItem = menuItems.find(m => m.productID === top.productID);
      if (menuItem) {
        return {
          productID: menuItem.productID,
          name: menuItem.name,
          price: menuItem.price,
          picture: menuItem.picture,
          category: menuItem.category,
          description: menuItem.description || "",
          backgroundHexacode: menuItem.backgroundHexacode || 0,
          totalSold: top.totalSold
        };
      }
      return null;
    }).filter(Boolean);

    res.json({
      status: "Success",
      message: "Top 5 sản phẩm bán chạy nhất",
      data: result
    });

  } catch (err) {
    console.error("Lỗi khi lấy top bán chạy:", err);
    res.json({
      status: "Failed",
      message: "Lỗi khi lấy top sản phẩm bán chạy",
      detail: err.message
    });
  }
})

module.exports = router
const express = require('express')
const router = express.Router()
const menu =require('../models/menu')
const dotenv = require('dotenv')
dotenv.configDotenv()
const multer = require('multer');
const user = require('../models/user')
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'menu image',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});
const upload = multer({ storage });

//------------ADD------------
router.post('/add', upload.single('picture'), async (req, res) => {
  try {
    const { name, price, description, category, backgroundHexacode} = req.body;
    const product_picture = req.file ? req.file.path : null;
    const prefixMap = {
      cake: "C", drink: "D", launch: "L"
    }
    const prefix = prefixMap[category]
    if(!prefix) return res.status(400).json({message:"Category không hợp lệ"}
    )
    
    const lastProduct = await menu.findOne({category}).sort({productID:-1}) // sort giảm dần
    let nextNumber = 1; 
    if(lastProduct&&lastProduct.productID){
      const num = parseInt(lastProduct.productID.substring(1))
      nextNumber = num+1
    }
    const productID = `${prefix}${String(nextNumber).padStart(2,'0')}`
    const newProduct = new menu({
      name,
      productID,
      price,
      category,
      picture: product_picture,
      description,
      backgroundHexacode,
      sumofFavorites: 0,
      sumofRatings: 0,
      sumofReviews: [],
    });

    const result = await newProduct.save();
    res.json({ status: "Success", message: "Product added successfully", data: result
    });

  } catch (err) {
    res.json({ status: "Failed", message: "Internal server error", detail: err.message });
  }
});
//------------DELETE-------------
router.delete('/delete', async (req, res)=>{
    try {
    const { productID } = req.body;

    const result = await menu.deleteOne({ productID });
    if (result.deletedCount > 0) {
      res.json({ status: "Success", message: "Xóa sản phẩm thành công " });
    }
  } catch (err) {
    res.json({status: "Failed", message: "Lỗi hệ thống", detail: err});
  }
})

//-----------LIST ALL------------
router.get('/all-product', async (req, res)=>{
    try{
        const products = await menu.find()
        res.json({status: "Success", message: "Liệt kê tất cả các sản phẩm thành công", data: products})
    }
    catch(err){
        res.json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
    }

})
//----------------PRODUCT DETAIL---------------
router.get('/product', async(req,res)=>{
  const {productID} = req.query
  try{
    const finditem = await menu.findOne({productID})
    res.json({status: "Success", message: "Liệt kê sản phẩm thành công", data: finditem})
  }
  catch(err){
    res.json({status: "Failed", message: "Internal server error", detail: err.message})
  }
})
//-----------FILTER THEO GIA TIEN VA THE LOAI--------------
router.get('/filter', async (req, res) => {
  try {
    let { minprice, maxprice, category } = req.query;
    const filter = {};
    minprice = Number(minprice);
    maxprice = Number(maxprice);

    if (!isNaN(minprice) && !isNaN(maxprice)) {
      filter.price = { $gte: minprice, $lte: maxprice };
    }

    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') }; // không phân biệt hoa/thường
    }

    console.log("Filter applied:", filter);

    const products = await menu.find(filter);
    res.json({ status: "Success", data: products });
  } catch (err) {
    res.json({ status: "Failed", message: "Error occuring", detail: err.message });
  }
});

//----------THEM SAN PHAM VAO DANH SACH YEU THICH----------
router.post('/favorite-add', async (req,res)=>{
    try{
        let {userID, productID} = req.query
        const userData = await user.findById(userID);
        userData.favoriteProduct.push(productID)
        await userData.save()
        const productData = await menu.findOne({productID})
        productData.sumofFavorites = productData.sumofFavorites + 1;
        await productData.save()
        res.json({status: "Success", message: "Thêm sản phẩm vào danh sách yêu thích thành công"})
    }
    catch(err){
      res.json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
    }
})
// //----------XOA SAN PHAM KHOI DANH SACH YEU THICH-----------
router.delete('/favorite-delete', async (req, res)=>{
  try{
    let {userID, productID} = req.query
    const userData = await user.findById(userID)
    const index = userData.favoriteProduct.indexOf(productID);
    userData.favoriteProduct.splice(index, 1);
    await userData.save()

    const productData = await menu.findOne({productID})
    menu.sumofFavorites = menu.sumofFavorites -1
    await productData.save()
    res.json({status: "Success", message: "Xóa sản phẩm khỏi danh sách yêu thích thành công"})
  }
  catch(err){
      res.json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
    }
})
//-------------XEM DANH SACH YEU THÍCH---------
router.get('/favorite-list', async (req,res)=>{
  try{
    let { userID } = req.query
    const usercheck = await user.findById(userID)
    const userData = usercheck.favoriteProduct
    if(!userData){
      return res.json({status: "Success", message: "Không có sản phẩm yêu thích được thêm vào"})
    }
    const favor = await menu.find({
      productID: {$in: userData}
    })
    res.json({
      status: "Success",
      message: "Liệt kê danh sách yêu thích thành công",
      count: favor.length,
      data: favor
    });
  }
    catch(err){
      res.json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
    }
})
//-------------------Tim kiếm sản phẩm----------------------
router.get('/search', async(req,res)=>{
  try{
    const {name} = req.query
    const products = await menu.find({
      $or:[
        {name: {$regex: name, $options:'i'}},
      ]
    })
    res.status(200).json({message: products})
  }
  catch(err){
    res.status(500).json({message:'Lỗi tìm kiếm sản phẩm', detail: err.message})
  }
})
//------------------Thay thông tin sản phẩm-----------------
router.put('/change-product-detail', async(req, res)=>{
  try{
    const {productID, name, price, description} = req.body
    const findItem = await menu.findOne({productID})
    findItem.name = name
    findItem.price = price
    findItem.description = description
    await findItem.save()
    res.status(200).json({message:"Thay đổi thông tin sản phẩm thành công", data: findItem})
  }
  catch(err){
    res.status(500).json({message:'Lỗi tìm kiếm sản phẩm', detail: err.message})
  }
})

//Thay đổi hình ảnh sản phẩm 
router.put('/change-product-picture',upload.single('picture'), async (req,res)=>{
  try{
    const {productID} = req.body
    const new_product_picture = req.file ? req.file.path : null;
    const findProduct = await menu.findOne({productID})
    findProduct.picture = new_product_picture
    findProduct.save()
    res.status(200).json({message:"Thay đổi hình ảnh sản phẩm thành công", data: findProduct})
  }
  catch{
    res.status(500).json({message:'Lỗi tìm kiếm sản phẩm', detail: err.message})
  }
})
module.exports = router
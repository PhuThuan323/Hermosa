const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const user =require('../models/user')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()

const passport = require('passport')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const nodemailer = require('nodemailer')
const otpgen = require('otp-generator')

async function sendotp(email,otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
  const mailoptions = {
    from: user,
    to: email,
    subject: "Xác nhận đăng ký tài khoản",
    text: `Mã OTP xác thực tài khoản của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`
  }
  await transporter.sendMail(mailoptions)
}

//--------------------Sign Up----------------------------------------
router.post('/signup', async (req,res)=>{
    let { email } = req.body;
    email = email.trim();
    try{
      const fUser = user.find({ email })
      if (!fUser) { return res.json({ status: "Failed", message: "Tài khoản gmail đã được đăng kí ở một tài khoản khác"})}

      const otp = otpgen.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
      const otpExpires = new Date(Date.now()+5*60*1000)

      const newuser = new user({ email, otp, otpExpires, is_verified: false, signupMethod: "Username"});
      await newuser.save() 
      await sendotp(email, otp)
      res.status(200).json({ status: "Successful", statuscode: 200, message: "Vui lòng kiểm tra OTP để lấy mã xác thực" });
    }
    catch(err) {
      res.status(500).json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
    }
})
//----------------------Xác nhận OTP------------------------
router.post('/verify-otp', async (req,res)=>{
  try{
    const {email, otp} = req.body
    const foundUser = await user.findOne({email})
    if(foundUser.otp!==otp) return res.json({status:"Failed", message:"OTP không hợp lệ"})
    if(foundUser.otp_expire <Date.now()) return res.json({status: "Failed", message:"OTP đã hết hạn"})
    foundUser.is_verified = true
    foundUser.otp = null,
    foundUser.otp_expire = null,
    await foundUser.save()
    res.status(201).json({status: "Success", message: "Email đã xác thực thành công"})
  }
  catch(err){
    res.status(500).json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
  }
})
//--------------- User yêu cầu gửi lại otp -----------------
router.post('/resend-otp', async (req,res)=>{
  try{
    const {email} = req.body
    const fUser = await user.findOne({email})
    const otp_second = otpgen.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const otpExpires_second = new Date(Date.now()+5*60*1000)
    fUser.otp = otp_second
    fUser.otp_expire = otpExpires_second
    fUser.save()
    await sendotp(email,otp_second)
    res.status(200).json({status:"Success", messsage: "Resend OTP code successfull"})
  }
  catch(err){
    res.status(500).json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
  }
})
//Đặt mật khẩu và username và userID sau khi đã sign up thành công
router.put('/set-password-username', async (req,res)=>{
  try{
    const {email, password, username} = req.body
    const fUser = await user.findOne({email})
    const encryptedPassword = await bcrypt.hash(password,10)
    fUser.password = encryptedPassword
    fUser.name = username
    fUser.userID = fUser._id.toString()
    fUser.signupMethod = "Username"
    fUser.otp = undefined
    fUser.otp_expire = undefined
    await fUser.save()
    return res.status(201).json({status:"Success", message: "Username và password đã được lưu thành công"}) 
  }
  catch(err){
    res.status(500).json({status: "Failed", message: "Lỗi hệ thống", detail: err.message})
  }
})
//--------------------Login------------------------------------------ 
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
    const foundUser = await user.findOne({ email });
    if (!foundUser) {
      return res.status(401).json({
        status: "Failed",
        message: "Không tìm thấy người dùng"
      });
    }
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "Failed",
        message: "Sai mật khẩu"
      });
    }
    if (!foundUser.userID) {
      foundUser.userID = foundUser._id.toString(); 
      await foundUser.save();
    }
    res.status(200).json({status: "Success",message: "Đăng nhập thành công",data: foundUser
    });

  } catch (err) {
    res.status(501).json({status: "Failed", message: "Lỗi hệ thống", detail: err.message});
  }
});

//--------------------Signin or Signup with GG---------------------------------
router.get("/google/login", 
  passport.authenticate("google", { scope: ["profile", "email"] })
)
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  async (req, res) => {
    try {
      const googleUser = req.user;
      const email = googleUser.emails?.[0]?.value || null;
      const name = googleUser.displayName || "No Name";

      let existingUser = await user.findOne({ email });

      if (!existingUser) {
        const newUser = new user({name,email, password: null, is_verified: true, signupMethod: "Google"});
        await newUser.save(); 
        return res.status(201).json({ status: "Success", message: "Tạo tài khoản thành công với Google", data: newUser });}
      else{
        return res.status(200).json({status: "Success",message: "Đăng nhập thành công với Google", data: existingUser});
      }
        

    } catch (err) {
      console.error(err);
      res.status(501).json({ status: "Failed", statuscode: 500, message: "Server error", error: err.message });
    }
  }
)
router.get("/google-login-failed", (req, res) => {
  res.json({ status: "Failed", statuscode:401, message: "Đăng nhập với Google thất bại" });
})
 
//----------------- Signin or Signup with Facebook -----------------
router.get('/facebook/login',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/facebook-login-failed' }),
  async (req, res) => {
    try {
      const fbUser = req.user;
      const email = fbUser.emails?.[0]?.value || null;
      const name = fbUser.displayName || "No Name";

      let existingUser = await user.findOne({ email });

      if (!existingUser) {
        const newUser = new user({
          name,
          email,
          password: null,
          is_verified: true,
          signupMethod: "Facebook"
        });
        await newUser.save();

        return res.status(201).json({
          status: "Success",
          message: "Tạo tài khoản thành công với Facebook",
          data: newUser
        });
      } else {
        return res.status(200).json({
          status: "Success",
          message: "Đăng nhập thành công với Facebook",
          data: existingUser
        });
      }

    } catch (err) {
      console.error(err);
      res.status(501).json({
        status: "Failed",
        statuscode: 500,
        message: "Lỗi hệ thống",
        error: err.message
      });
    }
  }
);
router.get("/facebook-login-failed", (req, res) => {
  res.json({ status: "Failed", statuscode:401, message: "Đăng nhập Facebook thất bại" });
})

//--------------------Delete User-------------------------------
//Khi xóa tài khoản cần phải nhập mật khẩu chính xác
router.delete('/delete', async (req, res) => {
  try {
    const { userId, password } = req.body;

    const foundUser = await user.findOne({ userId });

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ status: "Failed", message: "Mật khẩu trước đó của bạn không chính xác" })
    }
    await user.deleteOne({ userId });

    return res.status(200).json({ status: "Success",message: "Xóa tài khoản thành công"});

  } catch (error) {
    console.error(error);
    return res.status(501).json({status: "Failed", message: "Lỗi hệ thống: " + error.message,});
  }
});
//Thay đổi mật khẩu trong trường hợp nhớ mật khẩu cũ
router.put('/change-password', async(req, res)=>{
    const { userID, password, newPassword } = req.body
    const foundUser = await user.findOne({userID})
    const isMatch = bcrypt.compare(password, foundUser.password)
    if(!isMatch){
        return res.json({status:"Failed", message:"Mật khẩu cũ không chính xác"})
    }
    else{
        foundUser.password = await bcrypt.hash(newPassword,10)
        await foundUser.save()
        return res.json({status:"Success", message:"Thay đổi mật khẩu thành công"})
    }
})
//Nếu quên mật khẩu cần nhập mã OTP gửi về email, nếu mã OTP đúng thì hệ thống tự động cấp phát một mật khẩu 
// ngẫu nhiên rồi gửi về email mật khẩu đó cho người dùng
//người dùng sử dụng mã otp đó để thay đổi mật khẩu mới. 
async function sendTempPassword(email, tempPass){
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const mailoptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mật khẩu tạm thời của bạn - Hermosa Coffee",
    text: `Xin chào bạn, \nHệ thống đã cung cấp một mật khẩu tạm thời cho bạn: ${tempPass}
    \nVui lòng sử dụng mật khẩu này để đăng nhập và thay đổi sang mật khẩu mới nhé! 
    \n\nCảm ơn bạn đã kiên nhẫn và luôn hỗ trợ tụi mình!\nTrân trọng!`
  }
  await transporter.sendMail(mailoptions)
}
router.post('/forgot-password',async(req,res)=>{
  try{
    const {email} = req.body
    const fUser = await user.findOne({email})
    const tempPassword = otpgen.generate(8,{
      upperCaseAlphabets:true, lowerCaseAlphabets:true, specialChars:true
    })
    const hashTemppass = await bcrypt.hash(tempPassword,10)
    fUser.password = hashTemppass
    await fUser.save()
    await sendTempPassword(email, tempPassword)
    res.status(200).json({status: "Sucsess", message: "Mật khẩu tạm của bạn đã được gửi đến email. Hẫy kiểm tra email nhé"})
  }
  catch(err){
    return res.status(501).json({status: "Failed", message: "Lỗi hệ thống: " + err.message,});
  }

})

router.get('/view-all-user', async (req,res)=>{
  try{
    const User = await user.find()
    res.json({status:"Success", message: "Xem dnah sách tất cả khách hàng thành công", data: User})
  }
  catch (error) {
    res.status(501).json({
      message: 'Lỗi hệ thống: ' + error.message,
    });
  }
})
module.exports = router
require('./config/db'); 
require('dotenv').config();
const  port = process.env.PORT
const express = require('express');
const app = express();
const passport = require("passport");
const session = require("express-session");
require('./config/passport_gg')
require('./config/passport_fb')
const User = require("./models/user");

const cors = require('cors');
app.use(cors()); 

app.use(express.json());

app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const userRoute = require('./api/1.users')
app.use('/user', userRoute); 

const menuRoute = require('./api/2.menu')
app.use('/menu',menuRoute)

const cartRoute = require('./api/3.carts')
app.use('/cart',cartRoute)

const orderRoute = require('./api/order/orders')
app.use('/order',orderRoute)

const paymentRoute = require('./api/payment/momo')
app.use('/momo', paymentRoute)

const payment2Route = require('./api/payment/vnpay')
app.use('/vnpay', payment2Route)

const toppingRoute = require('./api/4.toppings')
app.use('/topping', toppingRoute)

const voucherRoute = require('./api/order/vouchers')
app.use('/voucher', voucherRoute)

const notificationRoute = require('./api/5.notifications')
app.use('/notification', notificationRoute)

const deliverAddressRoute = require('./api/deliver/addresses')
app.use('/address', deliverAddressRoute)

const deliverRoute = require('./api/deliver/deliver')
app.use('/deliver', deliverRoute)

app.listen(port, () => console.log("Server running on port 8000"));

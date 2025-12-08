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

app.use(express.json());

app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const userRoute = require('./api/users')
app.use('/user', userRoute); 

const menuRoute = require('./api/menu')
app.use('/menu',menuRoute)

const cartRoute = require('./api/carts')
app.use('/cart',cartRoute)

const orderRoute = require('./api/orders')
app.use('/order',orderRoute)

const paymentRoute = require('./api/momo')
app.use('/payment-momo', paymentRoute)

const payment2Route = require('./api/vnpay')
app.use('/payment-vnpay', payment2Route)

const toppingRoute = require('./api/toppings')
app.use('/topping', toppingRoute)

app.listen(port, () => console.log("Server running on port 8000"));

require("dotenv").config();
let express = require('express');
let app = express();
const path = require('path')
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(cors());


app.get("/login", (req, res)=>{
    res.render("Login");
})
app.get("/register", (req, res)=>{
    res.render("Register");
})
app.get("/payment", (req, res)=>{
    res.send("Insert Payment Portal")
})
app.get("/resetPassword/:id", (req, res)=>{
    res.render("ResetPassword",{ id : req.params.id});
})

app.use("/", authRoutes);

app.listen(3000,()=> {
    console.log("Started");
})
let express = require('express');
let app = express();
const path = require('path')

// const passport = require('passport')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')



app.get("/login", (req, res)=>{
    res.render("Login");
})
app.get("/register", (req, res)=>{
    res.render("Register");
})
app.get("/payment", (req, res)=>{
    res.send("Insert Payment Portal")
})
app.get("/", (req, res)=>{
    res.send("Home page")
})
app.listen(3000,()=> {
    console.log("Started");
})
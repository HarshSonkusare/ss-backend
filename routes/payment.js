var express = require("express");
var router = express.Router();
const Event = require("../models/event");
const User = require("../models/user");
const Razorpay = require('razorpay');
const { isSignedIn } = require("../controllers/auth");
const { check, validationResult } = require("express-validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const feesBharo = require("../models/feesBharo");
const Transaction = require("../models/transaction");
const PromoCode = require("../models/promoCode");

router.post("/:event_id", (req,res) => {
    const {event_id} = req.params;
    const {specialEvent, promo} = req.body;
    if(specialEvent === 1){
        // console.log("special event")
        const key = req.params.event_id;  
        feesBharo.findOne({key:key}, (err, fees) => {
            if(err || !fees){
                return res.status(400).json({
                    error: "Something Went Wrong!!"
                });
            }
            let {registration_fee} = fees;
            if(key === "entry" && promo){
                const len = promo.length;
                if(len <= 7){
                    PromoCode.findOne({code:promo}, (err, promocode)=>{
                        if (err || !promocode) {
                            return res.status(400).json({ message: "Invalid Promo Code"});
                        }
                        if(promocode.count <= 0){
                            return res.json({
                                message:"promo code expired"
                            });
                        }
                        let val = promocode.value;
                        val = (val*registration_fee);
                        val = val/100;
                        registration_fee = registration_fee - val;
                        let instance = new Razorpay({
                        key_id: process.env.RAZORPAY_KEY_ID,
                        key_secret: process.env.RAZORPAY_KEY_SECRET,
                        });
                        instance.orders.create({
                            amount: registration_fee * 100,
                            currency: "INR"
                        }).then((order) => {res.send(order)}).catch((err) => {res.send(err)});
                    });
                }
                else{
                    const refId = promo;
                    User.findOne({_id:refId}, (err,user)=>{
                        if (err || !user) {
                            return res.status(400).json({ message: "Invalid referral Code"});
                        }
                        if(user.referralCount >= 100){
                            return res.json({
                                message: "referral code expired",
                            })
                        }
                        let instance = new Razorpay({
                        key_id: process.env.RAZORPAY_KEY_ID,
                        key_secret: process.env.RAZORPAY_KEY_SECRET,
                        });
                        instance.orders.create({
                            amount: registration_fee * 100,
                            currency: "INR"
                        }).then((order) => {res.send(order)}).catch((err) => {res.send(err)});
                    })
                }
            }
            else{
                let instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
                });
                instance.orders.create({
                    amount: registration_fee * 100,
                    currency: "INR"
                }).then((order) => {res.send(order)}).catch((err) => {res.send(err)});
            }
            
            // console.log(registration_fee);
            
        });
    // feesBharo.find({}, (err, fees) => {
    //     console.log(fees[0]);
    // })
    // return;
    }
    else{
        Event.findById(event_id, (err, event) => {
            if(err || !event){
                return res.status(400).json({
                    error: "Event not found"
                });
            }
            const {registration_fee} = event;
            // console.log(registration_fee);
            let instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            instance.orders.create({
                amount: registration_fee * 100,
                currency: "INR"
            }).then((order) => {res.send(order)}).catch((err) => {res.send(err)});
        });
    }
    
})
router.post("/store/details", (req, res) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature, id, event_id, specialEvent, promo} = req.body;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET )
                                    .update(razorpay_order_id + '|' + razorpay_payment_id)
                                    .digest('hex');
    if(razorpay_signature !== expectedSignature){
        return res.status(400).json({
            error: "Payment failed"
        });
    }
    if(specialEvent === 1){
        User.findById(id,(err,user) => {
            if (err || !user) {
                return res.status(400).json({ message: "Couldn't find user" });
            }

            feesBharo.findOne({key:event_id}, (err, fees) => {
                if (err || !fees) {
                    return res.status(400).json({ message: "Couldn't find Event" });
                }
                const key = event_id;
                let {registration_fee} = fees;
                if(key === "entry" && promo){
                    const len = promo.length;
                    if(len <= 7){
                        PromoCode.findOne({code:promo}, (err, promocode)=>{
                            if (err || !promocode) {
                                return res.status(400).json({ message: "Invalid Promo Code"});
                            }
                            if(promocode.count <= 0){
                                return res.json({
                                    message:"promo code expired"
                                });
                            }
                            let n = promocode.count;
                            n = n-1;
                            promocode["count"] = n;
                            promocode.save();
                            let val = promocode.value;
                            val = (val*registration_fee);
                            val = val/100;
                            registration_fee = registration_fee - val;
                        });
                    }
                    else{
                        const refId = promo;
                        User.findOne({_id:refId}, (err,u)=>{
                            if (err || !u) {
                                return res.status(400).json({ message: "Invalid referral Code"});
                            }
                            if(u.referralCount >= 100){
                                return res.json({
                                    message: "referral code expired",
                                })
                            }
                            let n = u.referralCount;
                            n = n+1;
                            u["referralCount"] = n;
                            u.save();
                        })
                    }
                }
                const events = key.split(',');
                events.map((e)=>{
                    if(e==="entry"){
                        user["paidForEvent"] = 1;
                    }
                    else if(e==="accomodation"){
                        user["paidForAccomodation"] = 1;
                    }
                    else if(e==="ps1"){
                        user["paidForProshow1"] = 1;
                    }
                    else if(e==="ps2"){
                        user["paidForProshow2"] = 1;
                    }
                    else if(e==="ps3"){
                        user["paidForProshow3"] = 1;
                    }
                    else if(e==="ps"){
                        user["paidForProshow1"] = 1;
                        user["paidForProshow2"] = 1;
                        user["paidForProshow3"] = 1;
                    }
                });
                user.save();
                fees.registered_users.push({_id:user._id, name:user.name, email:user.email, mobile:user.mobile});
                fees.save();
                sendMail(user.email,fees.name,razorpay_payment_id,registration_fee);
            });
        });
        // return;
        // console.log("in store ");
        const errors = validationResult(req);
        // console.log(errors);
        if (!errors.isEmpty()) {
            return res.status(422).json({
            error: errors.array()[0].msg,
            });
        }

        // const { event_id, registration_fee, name, email, mobile, event, razorpay_payment_id } = req.body;
        // console.log(req.body)
        const transaction = new Transaction(req.body);
        transaction.save((err, tran) => {
            if (err) {
                return res.status(400).json({
                err: "NOT able to save transaction details in DB",
                });
            }
            return res.json({...tran, status : "success"});
        });
    }
    else{
        Event.findOne({_id:event_id}, (err,event)=>{
            if (err || !event) {
                return res.status(400).json({ message: err.message });
            }
            // console.log(event);
            User.findById(id,(err,user) => {
                if (err || !user) {
                    return res.status(400).json({ message: "Couldn't find user" });
                }
    
                event.registered_users.push({ name:user.name, email:user.email, mobile:user.mobile});
                event.save();
                user.events.push({
                                event_id : event_id, 
                                name : event.name,
                                summary : event.summary,
                                venue : event.venue,
                                event_manager : event.event_manager,
                                registration_fee : event.registration_fee,
                                rounds : event.rounds,
                                prize_money : event.prize_money,
                                no_of_prizes : event.no_of_prizes,
                                social_media : event.social_media,
                                description : event.description,
                                structure : event.structure,
                                rules : event.rules,
                                specialEvent : event.specialEvent,
                                key : event.key,
                                disqualification : event.disqualification,
                                judging_criteria : event.judging_criteria,
                                poster : event.poster,
                                used : 0,
                                category : event.category,
                                start_date : event.start_date,
                                end_date : event.end_date
                            });
                user.save();
                // send email to the registered user 
                const text = "You can use QR from Profile page on SpringSpree website for Pro Show Entry";
                sendMail(user.email,event.name,razorpay_payment_id,event.registration_fee, text);
            });
            
        });
        // console.log("in store ");
        const errors = validationResult(req);
        // console.log(errors);
        if (!errors.isEmpty()) {
            return res.status(422).json({
            error: errors.array()[0].msg,
            });
        }

        // const { event_id, registration_fee, name, email, mobile, event, razorpay_payment_id } = req.body;
        // console.log(req.body);
        const transaction = new Transaction(req.body);
        transaction.save((err, tran) => {
            if (err) {
                return res.status(400).json({
                err: "NOT able to save transaction details in DB",
                });
            }
            // console.log("added transaction", tran);
            return res.json({...tran, status : "success"});
        });
    }


});

const sendMail =  (email, name, razorpay_payment_id, registration_fee, text="") => {
    var transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    var mailOptions = {
      from: `SpringSpree 22 <webdev@springspree.in>`,
      to: email,
      subject: `You have successfully registered for ${name}`,
      text: "",
      html: `
    <div style="background-color: rgb(60, 60, 60); margin: -1rem; height: fit-content; color:white!important">
      <div style=" margin: 0 10vw !important;   background-color: #141414;   min-height: 50vh;   color: white !important; padding: 10%">
        <div style="color: white;   padding: 1rem auto;   display: flex;   justify-content: center;">
          <img style="margin: 1rem auto;   width: 150px;"
            src="${process.env.HOST}/static/ss22.jpeg"
            alt="SpringSpree22"
          />
        </div>
        <div style="padding: 0 2rem;   text-align: left;   font-family: "Clash Display", sans-serif;   color: white;">
          <h3 style="font-weight: 500;color: white !important;">You have successfully registered for Event ${name}</h3>
          <div>
            <p>${text}</p>
            <br>
            <p><b>Payment receipt </b></p>
            <table>
                <tr>
                    <td>User Email</td>
                    <td>${email}</td>
                </tr>
                <tr>
                    <td>Event Name</td>
                    <td>${name}</td>
                </tr>
                <tr>
                    <td>Registration Fees</td>
                    <td>${registration_fee}</td>
                </tr>
                <tr>
                    <td>Transaction ID</td>
                    <td>${razorpay_payment_id}</td>
                </tr>
                <tr>
                    <td>Status</td>
                    <td>Success</td>
                </tr>
            </table>
            <br />
            <br />
            <footer>
              <hr style="color: gray" />
              <br />
    
              Best Wishes,
              <br />
              <br />
              <b>Spring Spree</b>
              <br />
              NIT Warangal<br />
    
              Contact Us:
              <a style="color: white;" style="color: white" href="webdev@springspree.in"
                >webdev@springspree.in</a
              >
    
              <p style="margin-top: 0.3rem !important;">
                Visit us on
                <a style="color: white;" href="https://springspree22.in" target="blank"> Our Website </a> |
                <a style="color: white;" href="https://instagram.com/springspree_nitw?utm_medium=copy_link" target="blank"
                  >Instagram</a
                >
                |
                <a style="color: white;" href="https://m.facebook.com/SpringSpree22" target="blank">
                  Facebook
                </a>
              </p>
            </footer>
          </div>
        </div>
      </div>
    
      <!--  -->
    </div>`,
    };
    var mail_sent = false;
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        mail_sent = false;
      } else {
        mail_sent = true;
      }
    });
    return mail_sent;
  };

module.exports = router;
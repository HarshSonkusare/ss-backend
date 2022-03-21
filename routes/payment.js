var express = require("express");
var router = express.Router();
const Event = require("../models/event");
const Razorpay = require('razorpay');
const { isSignedIn } = require("../controllers/auth");
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.post("/:event_id", (req,res,next)=>{
    
    next();
} , (req,res) => {
    const {event_id} = req.params;
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
})
router.post("/verify", (req,res) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET )
                                    .update(razorpay_order_id + '|' + razorpay_payment_id)
                                    .digest('hex');
    if(razorpay_signature !== expectedSignature){
        return res.status(400).json({
            error: "Payment failed"
        });
    }
    res.send("Payment Successful");
})
module.exports = router;
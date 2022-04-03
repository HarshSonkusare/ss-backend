var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const PromoCode = require("../models/promoCode");
const User = require("../models/user");


router.post("/addPromoCode", (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }
    const promo = new PromoCode(req.body);
    promo.save((err,p)=>{
        if (err) {
            return res.status(400).json({
              err_msg: err,
              err: "NOT able to save Promo Code in DB",
            });
        }
        return res.json(p);
    })
});

router.post("/checkValidity", (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }
    const {promo} = req.body;

    const len = promo.length;
    if(len <= 7){
        PromoCode.findOne({code:promo}, (err, promocode)=>{
            if (err || !promocode) {
                return res.status(400).json({ message: "Invalid Promo Code"});
            }
            if(promocode.count <= 0){
                return res.json({
                    valid: 0,
                });
            }
            // let n = promocode.count;
            // n = n-1;
            // promocode["count"] = n;
            // promocode.save();
            return res.json({
                valid : 1,
                value: promocode.value,
            });
        });
    }
    else{
        const refId = promo;
        User.findOne({_id:refId}, (err,user)=>{
            if (err || !user) {
                return res.status(400).json({ message: "Invalid referral Code"});
            }
            if(user.referralCount >= 100){
                return res.status(400).json({ message: "Referral Code Expired"});
            }
            return res.json({
                valid : 1,
            });
        })
    }
    
});

module.exports = router;
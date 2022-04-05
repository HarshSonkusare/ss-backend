var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const { isSignedIn } = require("../controllers/auth");
const { getAllEvents, addEvent, register_event, getQRCode, checkQRCode, getRegisteredEvents } = require("../controllers/event");
const upload = require("../utils/upload");
const feesBharo = require("../models/feesBharo");
const User = require("../models/user");

router.get("/event/all", getAllEvents);
router.post("/event/add", upload.single("poster") , addEvent);

router.post("/register/:event_id", isSignedIn, register_event);

// router.get("/qrCode/:event_id", isSignedIn, getQRCode);

router.get("/qrCode/check/:id", checkQRCode);

router.get("/getRegisteredEvents", isSignedIn, getRegisteredEvents);

router.get("/getAll/specialEvents",(req, res) => {
    feesBharo.find({},(err,fees)=>{
        if(err){
            return res.json(err);
        }
        return res.json(fees);
    })
});


router.get("/getRegistrationData", (req, res)=>{
    User.find({}, (err, users)=>{
        if(err || !users){
            return res.status(400).json({
                error : err
            });
        }
        let registration = 0;
        let accomodation = 0;
        let proshow1 = 0;
        let proshow2 = 0;
        let proshow3 = 0;
        users.map((u)=>{
            const email = u.email;
            const mail = email.split("@");

            if(mail[1] != "student.nitw.ac.in"){
                if(u.paidForEvent > 0){
                    registration += 1;
                }
                if(u.paidForAccomodation > 0){
                    accomodation += 1;
                }
                if(u.paidForProshow1 > 0){
                    proshow1 += 1;
                }
                if(u.paidForProshow2 > 0){
                    proshow2 += 1;
                }
                if(u.paidForProshow3 > 0){
                    proshow3 += 1;
                }
                
            }
        });
        return res.json({
            "No of Registrations" : registration,
            "Accomodation" : accomodation,
            "Pro Show 1" : proshow1,
            "Pro Show 2" : proshow2,
            "Pro Show 3" : proshow3
        })
    });
});

router.get("/getUserData", (req,res) => {
    User.find({}, (err,users) => {
        if(err || !users){
            return res.status(400).json({
                err : err
            });
        }
        let result = [];
        users.map((u)=>{
            const email = u.email;
            const mail = email.split("@");

            if(mail[1] != "student.nitw.ac.in"){
                let user = {};
                user['email'] = u.email;
                user['name'] = u.name;
                user['mobile'] = u.mobile;
                user['college'] = u.college;
                user['level'] = u.level;
                user['referralCount'] = u.referralCount;
                user['paidForEvent'] = u.paidForEvent;
                user['paidForAccomodation'] = u.paidForAccomodation;
                user['paidForProshow1'] = u.paidForProshow1;
                user['paidForProshow2'] = u.paidForProshow2;
                user['paidForProshow3'] = u.paidForProshow3;
                let event = [];

                u.events.map((e)=>{
                    event.push(e.name);
                })

                user['events'] = event;

                result.push(user);
            }
        });

        return res.json(result);
    })
});

module.exports = router;
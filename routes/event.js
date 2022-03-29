var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const { isSignedIn } = require("../controllers/auth");
const { getAllEvents, addEvent, register_event, getQRCode, checkQRCode, getRegisteredEvents } = require("../controllers/event");
const upload = require("../utils/upload");
const feesBharo = require("../models/feesBharo");

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

module.exports = router;
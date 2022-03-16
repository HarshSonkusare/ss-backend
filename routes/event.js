var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const { isSignedIn } = require("../controllers/auth");
const { getAllEvents, addEvent, register_event } = require("../controllers/event");
const upload = require("../utils/upload");

router.get("/event/all", getAllEvents);
router.post("/event/add", isSignedIn , upload.single("poster") , addEvent);

router.post("/register/:event_id", isSignedIn, register_event);

module.exports = router;
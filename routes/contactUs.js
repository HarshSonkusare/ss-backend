var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const { contactUs } = require("../controllers/contactUs");

router.post("/contactUs", contactUs);

module.exports = router;
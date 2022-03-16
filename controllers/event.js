const Event = require("../models/event");
// const Logger = require("../models/logger");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.getAllEvents = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }

    Event.find({},(err, events) => {
        if (err || !events) {
            return res.status(400).json({
              error: "No Events exists",
            });
        }
        return res.json(events);
    });
};

exports.addEvent = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }
    var fields = req.body;
    if (req.body.poster != '') {
        fields["poster"] = req.body.poster;
    } else {
        fields["poster"] = 'null';
    }
    const event = new Event(fields);
    event.save((err,e)=>{
        if (err) {
            return res.status(400).json({
              err_msg: err,
              err: "NOT able to save Event in DB",
            });
        }
        return res.json(e);
    });
};

exports.register_event = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }

    const id = req.auth._id;
    const event_id = req.params.event_id;

    // const user = 
};
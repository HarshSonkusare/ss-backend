const Event = require("../models/event");
const User = require("../models/user");
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
    // if (req.body.poster != '') {
    //     fields["poster"] = req.body.poster;
    // } else {
    //     fields["poster"] = 'null';
    // }
    let path = "";
    let mimetype = "";
    if(req.file){
      path = req.file.path ;
      mimetype =  req.file.mimetype;
    }
    // console.log(path);
    if(path!==""){
        path = path.replace(/^\s+|\s+$/g, '');
        path = path.replace(/\s\s+/g, '_');
        path = path.replace(/ /g, '_');
      path = `${process.env.HOST}/static/` + path.substring(6);
    }
    let path1 = path.replace(/\\/g, "/");
    fields["poster"] = path1;
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
    
    Event.findOne({_id:event_id}, (err,event)=>{
        if (err || !event) {
            return res.status(400).json({ message: err.message });
        }
        // console.log(event);
        User.findById(id,(err,user) => {
            if (err || !user) {
                return res.status(400).json({ message: "Couldn't find user" });
            }

            event.registered_users.push({_id:user._id, name:user.name, email:user.email, mobile:user.mobile});
            event.save();
            user.events.push({
                            event_id : event._id, 
                            name : event.name,
                            description : event.description,
                            hosted_by : event.hosted_by,
                            poster : event.poster,
                            price : event.price,
                            start_date : event.start_date,
                            end_date : event.end_date
                        });
            user.save();
            return res.json(user);
        });

    });
};
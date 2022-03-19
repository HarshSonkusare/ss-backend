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
                            judging_criteria : event.judging_criteria,
                            poster : event.poster,
                            used : 0,
                            category : event.category,
                            start_date : event.start_date,
                            end_date : event.end_date
                        });
            user.save();
            return res.json(user);
        });

    });
};

exports.getQRCode = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }

    

};

exports.checkQRCode = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }

    const id = req.params.id;
    const event_id = req.params.event_id;

    User.findById(id, (err, user)=>{
        if (err || !user) {
            return res.status(400).json({ message: "Couldn't find user" });
        }

        const registeredEvents = user.events;
        for(let i=0;i<registeredEvents.length;i++){
            let event = registeredEvents[i];
            if(event.event_id === event_id){
                if(event.used == 0){
                    event['used'] = 1;
                    registeredEvents[i] =  event;
                    user.events = registeredEvents;
                    user.save();
                    return res.json({
                        success : true,
                        message : "You can attend the event." 
                    });
                }
                else{
                    return res.json({
                        success : false,
                        message : "Entry denied."
                    });
                }
            }
        }
        return res.json({
            success : false,
            message : "You have not registered for the event"
        })
    });

};

exports.getRegisteredEvents = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }

    const id = req.auth._id;
    User.findById(id, (err, user)=>{
        if (err || !user) {
            return res.status(400).json({ message: "Couldn't find user" });
        }

        res.json({ registeredEvents:user.events});

    });

}
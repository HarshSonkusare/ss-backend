const Event = require("../models/event");
const User = require("../models/user");
// const Logger = require("../models/logger");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
const nodemailer = require("nodemailer");


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
            // send email to the registered user 
            sendMail(user,event,payment);
            return res.json(user);
        });

    });
};

const sendMail =  (email, link) => {
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
      subject: "Reset Your Password | SpringSpree NITW",
      text: "Do not share this code with anyone",
      html: `
    <div style="background-color: rgb(60, 60, 60); margin: -1rem; height: fit-content; color:white!important">
      <div style=" margin: 0 10vw !important;   background-color: #141414;   min-height: 50vh;   color: white !important; padding: 10%">
        <div style="color: white;   padding: 1rem auto;   display: flex;   justify-content: center;">
        //   <img style="margin: 1rem auto;   width: 150px;"
        //     src="https://backend.cseanitw.in/media/logos/mail_logo.png"
        //     alt="SpringSpree22"
        //   />
        </div>
        <div style="padding: 0 2rem;   text-align: left;   font-family: "Clash Display", sans-serif;   color: white;">
          <h3 style="font-weight: 500;color: white !important;">We have received a request for Password Reset</h3>
          <div>  
            <p>
              <strong style="color: white !important;">Follow this link to Reset Your Password: </strong>
              <a style="color: blue !important;" href="${link}">Reset Your Password</a>
            </p>
            <p>Or Copy This Link: ${link}</p>
            <br>
            <p><b>The Link will expire in one hour.</b></p>
            <small style="color: crimson !important;">Do not share this link with anyone as it contains sensitive information related to your Account.</small>
              <br />
              <br />
            <small style="color: aqua !important;">Please do not reply to this mail. It is auto generated and mails sent
              here are not attended to.</small>
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
              <a style="color: white;" style="color: white" href="mailto:csea@student.nitw.ac.in"
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
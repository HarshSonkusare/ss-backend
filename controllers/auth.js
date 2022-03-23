const User = require("../models/user");
// const Logger = require("../models/logger");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
require("dotenv").config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.signup = (req, res) => {
  const errors = validationResult(req);
  // console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  const {email} = req.body;
  
  const mail = email.split("@");

  if(mail[1] === "student.nitw.ac.in"){
    user["isAllowed"] = 1;
  }

  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB",
      });
    }
    // console.log(user);
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
      isAllowed: user.isAllowed,
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "USER email does not exists",
      });
    }

    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    const { _id, name, email } = user;
    return res.json({ token, user: { _id, name, email } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfully",
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.requestPasswordReset = async (req,res) => {
    const {email} = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user) 
      return res.status(403).send("User does not exist");
    
    // let token = await Token.findOne({ userId: user._id });
    // if (token) await token.deleteOne();
    // let resetToken = crypto.randomBytes(10).toString("hex");
    // const hash = crypto
    //             .createHmac("sha256", user.salt)
    //             .update(resetToken)
    //             .digest("hex");
    
    // await new Token({
    //   userId: user._id,
    //   token: hash,
    //   createdAt: Date.now(),
    // }).save();
    
    const link = `${process.env.HOST}/resetPassword/${user._id}`;
    sendMail(email,link);
    return res.json({link:`${link}`, message: "Mail Sent to Registered Mail"});
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
              <a style="color: white;" style="color: white" href="mailto:webdev@springspree.in"
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

  exports.resetPassword = async (req, res) => {
    const userId = req.params.id;
    
    // const token = req.query.token;
    // let passwordResetToken = await Token.findOne({ userId });
    // if (!passwordResetToken) {
    //   return res.status(403).render('resetPassword',{authCode:3, message: "Invalid or expired password reset token"});
    // }
  
    await User.findById(userId).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          id: userId,
          error: "Something unexpected happen",
        });
      }
    //   const hash_token = crypto
    //                     .createHmac("sha256", user.salt)
    //                     .update(token)
    //                     .digest("hex");
    //   if (hash_token != passwordResetToken.token) {
    //     return res.status(403).render('resetPassword',{authCode:3, message: "Invalid or expired password reset token"});
    //   }
      const {password1, password2} = req.body;
      if(password1 != password2) {
        return res.status(403).json({ message: "Passwords Do Not match"});
      }
      const hash = crypto
          .createHmac("sha256", user.salt)
          .update(password1)
          .digest("hex");
      user.encry_password = hash;
        User.findByIdAndUpdate(
          { _id: user._id },
          { $set: user },
          { new: true, useFindAndModify: false },
          async (err, new_user) => {
            if (err) {
              return res.status(400).json({
                error: "You are not authorized to update this user",
              });
            }
            // await passwordResetToken.deleteOne();
            user.salt = undefined;
            user.encry_password = undefined;
            res.json({ message: "Password reset successfully" });
          }
        );
    });
  };
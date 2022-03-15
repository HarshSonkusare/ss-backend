const User = require("../models/user");
// const Logger = require("../models/logger");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
require("dotenv").config();

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB",
      });
    }
    //log the entry
    // const logger = new Logger();
    // logger.visitor = user._id;
    // logger.requestType = "POST";
    // logger.description = "Signed up for portal";
    // logger.remoteAddress = req.socket.remoteAddress;
    // logger.save((err, logger) => {
    //   if (err) {
    //     return res.status(400).json({
    //       err: "NOT able to save LOG in DB",
    //     });
    //   }
    // });
    res.json({
      name: user.name,
      email: user.email,
      id: user._id,
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
    //log the entry
    // const logger = new Logger();
    // logger.visitor = user._id;
    // logger.requestType = "GET";
    // logger.description = "Signed in to portal";
    // logger.remoteAddress = req.socket.remoteAddress;
    // logger.save((err, logger) => {
    //   if (err) {
    //     return res.status(400).json({
    //       err: "NOT able to save LOG in DB",
    //     });
    //   }
    // });
    //send response to front end
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
  secret: 'WTINNITW',
  algorithms: ['RS256'],
  userProperty: "auth",
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


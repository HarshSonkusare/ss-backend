const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
const nodemailer = require("nodemailer");


exports.contactUs = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
          error: errors.array()[0].msg,
        });
    }

    const {name, email, mobile, dept, message} = req.body;

    let sendto = "";
    if(dept === "content_blogging"){
        sendto = "content_blogging@springspree22.in";
    }
    else if(dept === "design_deco"){
        sendto = "design_deco@springspree22.in";
    }
    else if(dept === "qcm"){
        sendto = "qcm@springspree22.in";
    }
    else if(dept === "webdev"){
        sendto = "webdev@springspree22.in";
    }
    else if(dept === "treasury"){
        sendto = "treasury@springspree22.in";
    }
    else if(dept === "ecc"){
        sendto = "ecc@springspree22.in";
    }
    else if(dept === "logistics"){
        sendto = "logistics@springspree22.in";
    }
    else if(dept === "proshows"){
        sendto = "proshows@springspree22.in";
    }
    else if(dept === "publicity"){
        sendto = "publicity@springspree22.in";
    }
    else if(dept === "sponsorship"){
        sendto = "sponsorship@springspree22.in";
    }
    else if(dept === "hospitality"){
        sendto = "hospitality@springspree22.in";
    }
    else {
        sendto = "ecc@springspree22.in";
    }

    sendMail(sendto, message, name, email, mobile);

};

const sendMail =  (sendto, message, name, email, mobile) => {
    var transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    var mailOptions = {
      from: `SpringSpree 22 <webdev@springspree.in>`,
      to: sendto,
      subject: "",
      text: "",
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
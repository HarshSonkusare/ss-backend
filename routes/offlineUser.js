var express = require("express");
var router = express.Router();
const OfflineUser = require("../models/offlineReg");


router.post("/addUser", (req, res)=>{
    const offuser = new OfflineUser(req.body);
    offuser.save((err, user)=>{
        if(err){
            return res.status(400).json({
                error: "unable to save user in db"
            })
        }
        return res.json(user);
    })
});

router.get("/getOfflineUserData", (req, res) => {
    let result = [];
    OfflineUser.find({}, (err, users)=>{
        if(err || !users){
            return res.status(400).json({
                err : "cannot find user"
            })
        }
        
        users.map((u)=>{
            let user = {};
            user['id'] = u._id;
            user['email'] = u.email;
            user['name'] = u.name;
            user['mobile'] = u.mobile;
            user['college'] = u.college;
            user['paymentMode'] = u.paymentMode;
            user['transactionId'] = u.transactionId;
            user['amountPaid'] = u.amountPaid;
            user['Accomodation'] = u.paidForAccomodation;
            user['Proshow1'] = u.paidForProshow1;
            user['Proshow2'] = u.paidForProshow2;
            user['Proshow3'] = u.paidForProshow3;
            result.push(user);
        })

        return res.json(result);
    })
})

router.get("/getOfflineUser/:email", (req,res) => {
    const {email} = req.params;

    OfflineUser.findOne({email:email}, (err,u)=>{
        if(err || !u){
            return res.status(400).json({
                err: "could not find user in database"
            });
        }
        return res.json(u);
    })
})

router.put("/updateOfflineUser/:id", (req,res) => {
    const {id} = req.params;
    OfflineUser.findOneAndUpdate(
        { _id: id },
        { $set: req.body },
        { new: true, useFindAndModify: false },
        (err, u) => {
          if (err || !u) {
            return res.status(404).json({ message: err });
          }
          return res.json(u);
        }
      );
});

module.exports = router;
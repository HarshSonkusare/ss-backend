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

    OfflineUser.find({}, (err, users)=>{
        if(err || !users){
            return res.status(400).json({
                err : "cannot find user"
            })
        }
        let registraion = 0;
        let accomodation = 0;
        let ps1 = 0;
        let ps2 = 0;
        let ps3 = 0;

        users.map((u)=>{
            registraion += 1;
            if(u.paidForAccomodation > 0){
                accomodation += 1;
            }
            if(u.paidForProshow1 > 0){
                ps1 += 1;
            }
            if(u.paidForProshow2 > 0){
                ps2 += 1;
            }
            if(u.paidForProshow3 > 0){
                ps3 += 1;
            }
        })

        return res.json({
            'Mode' : "Offline",
            'Registrations' : registraion,
            'Accomodation' : accomodation,
            'Pro Show 1' : ps1,
            'Pro Show 2' : ps2,
            'Pro Show 3' : ps3,
        });
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
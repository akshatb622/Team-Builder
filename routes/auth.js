const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();

router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
);

router.get("/google/callback",
passport.authenticate("google", { failureRedirect: "/" }),
    async (req,res)=>{
      req.session.token = req.user.accessToken[req.user.accessToken.length-1];
      res.cookie("token",req.session.token);
      try{
        await User.findOne({email:req.user.email}).then(async (err,user)=>{
            if(user){
                res.redirect("/user/dashboard");
            }else{
                console.log(req.user);
                res.redirect("/");
            }
      });
      }catch(e){
        console.log(e);
      }
      
  }
);

router.get("/logout", async (req,res)=>{
    await User.findOne({ email: req.user.email }).then(async(err,user)=>{
        user.accessToken.splice(user.accessToken.length-1,1);
        await user.save();
    })
    req.logout();
    req.session = null;
    req.token = null;
    res.cookie("token", "");
    res.redirect("/");
    
}); 

module.exports = router;
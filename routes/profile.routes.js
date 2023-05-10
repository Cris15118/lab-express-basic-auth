const express = require("express");
const router = express.Router();
const {isLoggedIn} = require("../middleware/auth.middleware.js")

router.get("/", isLoggedIn, (req, res, next)=>{
    res.render("profile/dashboard.hbs")
})



module.exports = router;
const express = require("express");
const router = express.Router();
const googleSignUpController = require("../controllers/googleSignUp.controller");

router.route("/").get(googleSignUpController.googleSignUp);
module.exports = router;

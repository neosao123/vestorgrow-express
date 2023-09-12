const express = require("express");
const CountryController = require("../controllers/country.controller")
const router = express.Router();
router.get("/getCountries", CountryController.get)
module.exports = router;
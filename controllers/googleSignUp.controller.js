const fs = require("fs");
const utils = require("../utils/utils");
const googleSignUpService = require("../services/googleSignUp.service");
const jwt = require("jsonwebtoken");

module.exports = {
  googleSignUp: async function (req, res) {
    const code = req.query.code;
    const resp = await googleSignUpService.verifyGoogleToken(code);
    try {
      if (resp && resp.id_token && resp.access_token) {
        const id_token = resp.id_token;
        const access_token = resp.access_token;

        const googleUser = jwt.decode(id_token);
        console.log("user", googleUser);
      }
    } catch (err) {
      console.log(err);
    }
  },
};

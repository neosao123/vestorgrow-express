const { log } = require("console");
const mobileUserService = require("../services/mobileUser.service");
const MobileUserService = require("../services/mobileUser.service");
const utils = require("../utils/utils");
const fs = require("fs");

module.exports = {
  add: async (req, res) => {
    const result = await MobileUserService.add(req.body);
    const status = result.status;
    delete result.status;
    if (status == 200) {
      res.status(200).send(result);
    } else {
      res.status(status).send(result);
    }
  },
  socialLogin: async function(req, res)  {


    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let userAgent = req.useragent;
    let reqMeta = {
      browser: userAgent.browser,
      os: userAgent.platform,
      ipAddress: ip,
      deviceType: userAgent.isDesktop
        ? "Desktop"
        : userAgent.isMobile
          ? "Mobile"
          : userAgent.isTablet
            ? "Tablet"
            : "Unknown",
      device: userAgent.isiPad
        ? "Apple Ipad"
        : userAgent.isiPhone
          ? "Apple Iphone"
          : userAgent.isMac
            ? "Apple MacBook"
            : userAgent.isSamsung
              ? "Samsung"
              : "Unknown",
    };
    const result = await MobileUserService.socialLogin(req.body, reqMeta);
    const status = result.status;
    delete result.status;
    res.status(status).send(result);
  },
  login: async function(req, res)  {

    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let userAgent = req.useragent;
    let reqMeta = {
      browser: userAgent.browser,
      os: userAgent.platform,
      ipAddress: ip,
      deviceType: userAgent.isDesktop
        ? "Desktop"
        : userAgent.isMobile
          ? "Mobile"
          : userAgent.isTablet
            ? "Tablet"
            : "Unknown",
      device: userAgent.isiPad
        ? "Apple Ipad"
        : userAgent.isiPhone
          ? "Apple Iphone"
          : userAgent.isMac
            ? "Apple MacBook"
            : userAgent.isSamsung
              ? "Samsung"
              : "Unknown",
    };

    const result = await MobileUserService.login(req.body, reqMeta);
    const status = result.status;
    delete result.status;
    if (status == 200) {
      res.status(200).send(result);
    } else {
      res.status(status).send(result);
    }
  },
  forgotPassword: async (req, res) => {
    const result = await MobileUserService.forgotPassword(req.body);
    const status = result.status;
    delete result.status;
    if (status == 200) {
      res.status(200).send(result);
    } else {
      res.status(status).send(result);
    }
  },
  changeEmail: async (req, res) => {
    const result = await MobileUserService.changeEmail(
      req.currUser,
      req.body.email
    );
    if (result.status == 400) {
      res.status(400).send({ message: result.message });
    } else {
      res.send(result);
    }
  },
  verifyEmail: async (req, res) => {
    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let userAgent = req.useragent;
    let reqMeta = {
      browser: userAgent.browser,
      os: userAgent.platform,
      ipAddress: ip,
      deviceType: userAgent.isDesktop
        ? "Desktop"
        : userAgent.isMobile
          ? "Mobile"
          : userAgent.isTablet
            ? "Tablet"
            : "Unknown",
      device: userAgent.isiPad
        ? "Apple Ipad"
        : userAgent.isiPhone
          ? "Apple Iphone"
          : userAgent.isMac
            ? "Apple MacBook"
            : userAgent.isSamsung
              ? "Samsung"
              : "Unknown",
    };
    reqMeta.device_id = req.body.device_id;
    reqMeta.auth_token = req.headers.authorization.replace("Bearer ", "");
    const result = await MobileUserService.verifyEmail(
      req.currUser,
      req.body.otp,
      req.body.isTwoStepVerify,
      reqMeta
    );
    if (result.status == 400) {
      res.status(400).send({ message: result.message });
    } else {
      res.send(result);
    }
  },
  addPassword: async (req, res) => {
    const { password, type } = req.body;
    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let userAgent = req.useragent;
    let reqMeta = {
      browser: userAgent.browser,
      os: userAgent.platform,
      ipAddress: ip,
      deviceType: userAgent.isDesktop
        ? "Desktop"
        : userAgent.isMobile
          ? "Mobile"
          : userAgent.isTablet
            ? "Tablet"
            : "Unknown",
      device: userAgent.isiPad
        ? "Apple Ipad"
        : userAgent.isiPhone
          ? "Apple Iphone"
          : userAgent.isMac
            ? "Apple MacBook"
            : userAgent.isSamsung
              ? "Samsung"
              : "Unknown",
    };

    let token = req.headers.authorization.replace("Bearer ", "")
    const result = await MobileUserService.addPassword(req.currUser, { password, type }, token, reqMeta);
    if (result.status == 400) {
      res.status(400).send({ message: result.message });
    } else {
      res.send(result);
    }
  },
  updateProfileImg: async (req, res) => {
    var filename = ""
    if (req.files.length != 0) {
      filename = req.files[0].filename;
    } else {
      filename = "";
    }
    const final_url = process.env.IMAGE_DESTINATION + filename;
    const result = await MobileUserService.updateProfileImg(
      req.currUser,
      final_url
    );
    const status = result.status;
    delete result.status;
    if (status == 200) {
      res.status(200).send(result);
    } else {
      res.status(status).send(result);
    }
  },
  resendOtp: async (req, res) => {
    const { type } = req.query;
    const result = await mobileUserService.resendOtp(req.currUser, type)
    if (result.status == 400) {
      res.status(400).send({ message: result.message });
    } else {
      delete result.status
      res.send(result);
    }
  },
  update_username: async (req, res) => {
    const result = await mobileUserService.update_username(req.currUser, req.body.user_name)
    if (result.status !== 200) {
      res.status(result.status).send({ message: result.message, userNameSuggestions: result.userNameSuggestionArr });
    } else {
      delete result.status;
      res.send(result);
    }
  },
  updateBio: async (req, res) => {
    const result = await mobileUserService.updateBio(
      req.currUser,
      req.body.bio
    );
    const status = result.status;
    delete result.status;
    if (status == 200) {
      res.status(200).send(result);
    } else {
      res.status(status).send(result);
    }
  },
  getUserSuggestion: async (req, res) => {
    const result = await mobileUserService.getUserSuggestion(
      req.currUser,
      req.body
    );
    const status = result.status;
    delete result.status;
    if (status == 200) {
      res.status(200).send(result);
    } else {
      res.status(status).send(result);
    }
  },
  getAvatarImages: async (req, res) => {
    const result = await mobileUserService.getAvatarImages();
    console.log("result==>", result);

    const status = result.status;
    delete result.status;
    if (status == 200) {
      res.status(200).send(result);
    } else {
      res.status(status).send(result);
    }
  },

};

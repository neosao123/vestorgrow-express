const UserServ = require("../services/user.service");
const utils = require("../utils/utils");
const fs = require("fs");

module.exports = {
  add: async function (req, res, next) {
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const tmp_path = req.files[i].path;
        let rendomNumber = Math.floor(1000 + Math.random() * 9000);
        let fileExtentsion = req.files[i].originalname.split(".");
        const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
        const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
        final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;

        console.log(final_path);

        fs.rename(tmp_path, final_path, (err) => {
          if (err) {
            return req.files[i].fieldname + " file linking failed";
          }
        });
        req.body[req.files[i].fieldname] = final_url;
      }
    }
    let user = req.body;
    let result = await UserServ.add(user, req.currUser);
    utils.sendResponse(result, req, res);
  },

  edit: async function (req, res, next) {
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const tmp_path = req.files[i].path;
        let rendomNumber = Math.floor(1000 + Math.random() * 9000);
        let fileExtentsion = req.files[i].originalname.split(".");
        const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
        const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
        final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
        fs.rename(tmp_path, final_path, (err) => {
          if (err) {
            return req.files[i].fieldname + " file linking failed";
          }
        });
        req.body[req.files[i].fieldname] = final_url;
      }
    }
    let oldData = await UserServ.getDetail(req.body._id);
    let result = await UserServ.edit(req.body, req.currUser);
    if (result) {
      if (fs.existsSync(oldData.data.profile_img)) {
        utils.deleteOldFile(oldData.data.profile_img, req.body.profile_img);
      }
      if (fs.existsSync(oldData.data.cover_img)) {
        utils.deleteOldFile(oldData.data.cover_img, req.body.cover_img);
      }
    }
    utils.sendResponse(result, req, res);
  },

  updateProfilePicture: async function (req, res, next) {
    if (req.files && req.files.length > 0) {
      const tmp_path = req.files[0].path;
      let rendomNumber = Math.floor(1000 + Math.random() * 9000);
      let fileExtentsion = req.files[0].originalname.split(".");
      const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
      const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
      final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
      fs.rename(tmp_path, final_path, (err) => {
        if (err) {
          return req.files[0].fieldname + " file linking failed";
        }
      });
      req.body[req.files[0].fieldname] = final_url;
    }
    let oldData = await UserServ.getDetail(req.body._id);
    let result = await UserServ.updateProfilePicture(req.body, req.currUser);
    if (result) {
      if (fs.existsSync(oldData.data.profile_img)) {
        utils.deleteOldFile(oldData.data.profile_img, req.body.profile_img);
      }
      if (fs.existsSync(oldData.data.cover_img)) {
        utils.deleteOldFile(oldData.data.cover_img, req.body.cover_img);
      }
    }
    utils.sendResponse(result, req, res);
  },
  updateCoverPicture: async function (req, res, next) {
    if (req.files && req.files.length > 0) {
      const tmp_path = req.files[0].path;
      let rendomNumber = Math.floor(1000 + Math.random() * 9000);
      let fileExtentsion = req.files[0].originalname.split(".");
      const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
      const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
      final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
      fs.rename(tmp_path, final_path, (err) => {
        if (err) {
          return req.files[0].fieldname + " file linking failed";
        }
      });
      req.body[req.files[0].fieldname] = final_url;
    }
    let oldData = await UserServ.getDetail(req.body._id);
    let result = await UserServ.updateCoverPicture(req.body, req.currUser);
    if (result) {
      if (fs.existsSync(oldData.data.profile_img)) {
        utils.deleteOldFile(oldData.data.profile_img, req.body.profile_img);
      }
      if (fs.existsSync(oldData.data.cover_img)) {
        utils.deleteOldFile(oldData.data.cover_img, req.body.cover_img);
      }
    }
    utils.sendResponse(result, req, res);
  },

  addProfile: async function (req, res, next) {
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const tmp_path = req.files[i].path;
        let rendomNumber = Math.floor(1000 + Math.random() * 9000);
        let fileExtentsion = req.files[i].originalname.split(".");
        const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
        const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
        final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
        fs.rename(tmp_path, final_path, (err) => {
          if (err) {
            return req.files[i].fieldname + " file linking failed";
          }
        });
        req.body[req.files[i].fieldname] = final_url;
      }
    }
    let result = await UserServ.addProfile(req.body);
    utils.sendResponse(result, req, res);
  },

  getDetail: async function (req, res) {
    let result = await UserServ.getDetail(req.params.id);
    utils.sendResponse(result, req, res);
  },

  editSetting: async function (req, res) {
    let result = await UserServ.editSetting(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  delete: async function (req, res) {
    let result = await UserServ.delete(req.params.id);
    if (result.toBeDeleted && result.toBeDeleted.length > 0) {
      utils.deleteFile(result.toBeDeleted);
      delete result.toBeDeleted;
    }
    utils.sendResponse(result, req, res);
  },

  listAll: async function (req, res) {
    let result = await UserServ.listAll(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  sessionList: async function (req, res) {
    let result = await UserServ.sessionList(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  login: async function (req, res) {
    let logintype = "";
    if (req.body.type) {
      logintype = req.body.type;
    }
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
    let result = await UserServ.login(req.body.email, req.body.password, logintype, req.body, reqMeta);
    utils.sendResponse(result, req, res);
  },

  otpLogin: async function (req, res) {
    let logintype = "";
    if (req.body.type) {
      logintype = req.body.type;
    }
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
    let result = await UserServ.otpLogin(req.body.email, req.body.password, req.body.otp, logintype, req.body, reqMeta);
    utils.sendResponse(result, req, res);
  },

  logout: async function (req, res) {
    let result = await UserServ.logout(req.body);
    utils.sendResponse(result, req, res);
  },

  forgetPassword: async function (req, res) {
    let result = await UserServ.forgetPassword(req.body.email);
    utils.sendResponse(result, req, res);
  },

  editFirstView: async function (req, res) {
    let result = await UserServ.editFirstView(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  updateOnlineStatus: async function (req, res) {
    let result = await UserServ.updateOnlineStatus(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  getOnlineStatus: async function (req, res) {
    let result = await UserServ.getOnlineStatus(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  signinActivationLink: async function (req, res) {
    let result = await UserServ.signinActivationLink(req.body.email);
    utils.sendResponse(result, req, res);
  },

  signupActiveLink: async function (req, res) {
    let result = await UserServ.signupActiveLink(req.body.email);
    utils.sendResponse(result, req, res);
  },

  activateAccount: async function (req, res) {
    let result = await UserServ.activateAccount(req.body);
    utils.sendResponse(result, req, res);
  },

  resetPassword: async function (req, res) {
    let result = await UserServ.resetPassword(
      req.body.email,
      req.body.newPassword,
      req.body.verifyPassword,
      req.body.otp
    );
    utils.sendResponse(result, req, res);
  },

  getSearchData: async function (req, res) {
    let result = await UserServ.getSearchData(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  mentionUsers: async function (req, res) {
    let result = await UserServ.getMentionUsers(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  mostFollowedUsers: async function (req, res) {
    let result = await UserServ.getMostFollowedUsers(req.body);
    utils.sendResponse(result, req, res);
  },

  addAccountVerified: async function (req, res) {
    let result = await UserServ.addAccountVerified(req.body);
    utils.sendResponse(result, req, res);
  },

  addInvestmentArray: async function (req, res) {
    let result = await UserServ.addInvestmentArray(req.body);
    utils.sendResponse(result, req, res);
  },

  addWebsite: async function (req, res) {
    let result = await UserServ.addWebsite(req.body);
    utils.sendResponse(result, req, res);
  },

  getUserPreviewData: async function (req, res) {
    let result = await UserServ.getUserPreviewData(req.body.userId, req.currUser);
    utils.sendResponse(result, req, res);
  },

  updateAbout: async function (req, res) {
    let result = await UserServ.updateAbout(req.body);
    utils.sendResponse(result, req, res);
  },

  suggestedUsers: async function (req, res) {
    let result = await UserServ.suggestedUsers(req.currUser);
    utils.sendResponse(result, req, res);
  },

  suggestionsByTab: async function (req, res) {
    let result = await UserServ.suggestionsByTab(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  }

};

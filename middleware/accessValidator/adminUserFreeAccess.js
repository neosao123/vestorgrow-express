const util = require("../../utils/utils");

module.exports = {
  postAuth: function (req, res, next) {
    if (
      util.checkRole(req.currUser, "admin") ||
      util.checkRole(req.currUser, "userPaid") ||
      util.checkRole(req.currUser, "userFree")
    ) {
      next();
    } else {
      util.sendResponse({ err: "Access denied." }, req, res);
    }
  },

  putAuth: function (req, res, next) {
    if (
      util.checkRole(req.currUser, "admin") ||
      util.checkRole(req.currUser, "userPaid") ||
      util.checkRole(req.currUser, "userFree")
    ) {
      next();
    } else {
      util.sendResponse({ err: "Access denied." }, req, res);
    }
  },

  deleteAuth: function (req, res, next) {
    if (
      util.checkRole(req.currUser, "admin") ||
      util.checkRole(req.currUser, "userPaid") ||
      util.checkRole(req.currUser, "userFree")
    ) {
      next();
    } else {
      util.sendResponse({ err: "Access denied." }, req, res);
    }
  },

  getDetailAuth: function (req, res, next) {
    if (
      util.checkRole(req.currUser, "admin") ||
      util.checkRole(req.currUser, "userPaid") ||
      util.checkRole(req.currUser, "userFree")
    ) {
      next();
    } else {
      util.sendResponse({ err: "Access denied." }, req, res);
    }
  },

  listAllAuth: function (req, res, next) {
    if (
      util.checkRole(req.currUser, "admin") ||
      util.checkRole(req.currUser, "userPaid") ||
      util.checkRole(req.currUser, "userFree")
    ) {
      next();
    } else {
      util.sendResponse({ err: "Access denied." }, req, res);
    }
  },
};

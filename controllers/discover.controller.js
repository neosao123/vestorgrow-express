const discoverServ = require("../services/discover.service");
const fs = require("fs");
const utils = require("../utils/utils");

module.exports = {
  listAll: async function (req, res) {
    let result = await discoverServ.listAll(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  getDetail: async function (req, res) {
    let result = await discoverServ.getDetail(req.params.id, req.currUser);
    utils.sendResponse(result, req, res);
  },
  
  listAllPublic: async function (req, res) {
    let result = await discoverServ.listAllPublic(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },
};

const discoverServ = require("../services/discover.service");
const fs = require("fs");
const utils = require("../utils/utils");
const postkeywordsService = require("../services/postkeywords.service");

module.exports = {
  listAll: async function (req, res) {
    let result = await discoverServ.listAll(req.body, req.query.page, req.currUser);
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

  listPopularTags: async function (req, res) {
    let result = await postkeywordsService.getPopularKeywords();
    utils.sendResponse(result, req, res)
  }
};

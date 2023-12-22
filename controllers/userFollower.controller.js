const userFollowerServ = require("../services/userFollower.service");
const utils = require("../utils/utils");

module.exports = {
  add: async function (req, res) {
    let faq = req.body;
    let result = await userFollowerServ.save(faq, req.currUser);
    utils.sendResponse(result, req, res);
  },

  unfollow: async function (req, res) {
    let result = await userFollowerServ.unfollow(req.params.id, req.currUser);
    utils.sendResponse(result, req, res);
  },

  listAll: async function (req, res) {
    let result = await userFollowerServ.listAll(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  listAllOther: async function (req, res) {
    let result = await userFollowerServ.listAllOther(req.body, req.params.id);
    utils.sendResponse(result, req, res);
  },

  getDetail: async function (req, res) {
    let result = await userFollowerServ.getDetail(req.params.id);
    utils.sendResponse(result, req, res);
  },

  isFollowing: async function (req, res) {
    let result = await userFollowerServ.isFollowing(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  sendReq: async function (req, res) {
    let faq = req.body;
    let result = await userFollowerServ.sendReq(faq, req.currUser);
    utils.sendResponse(result, req, res);
  },

  sendReqtoFollow: async function (req, res) {
    let faq = req.body;
    let result = await userFollowerServ.sendReqtoFollow(faq, req.body.userId);
    utils.sendResponse(result, req, res);
  },

  rejectReq: async function (req, res) {
    let result = await userFollowerServ.rejectReq(req.params.id, req.currUser);
    utils.sendResponse(result, req, res);
  },

  listAllReq: async function (req, res) {
    let result = await userFollowerServ.listAllReq(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  listAllSentReq: async function (req, res) {
    let result = await userFollowerServ.listAllSentReq(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  listAllFriends: async function (req, res) {
    let result = await userFollowerServ.listAllFriends(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  deleteReq: async function (req, res) {
    let result = await userFollowerServ.deleteReq(req.body.userId, req.body.followingId);
    utils.sendResponse(result, req, res);
  },

  deleteNotification: async function (req, res) {
    let result = await userFollowerServ.deleteNotification(req.body);
    utils.sendResponse(result, req, res);
  },


};

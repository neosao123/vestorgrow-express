const userBlockedServ = require("../services/userBlocked.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await userBlockedServ.save(faq, req.currUser);
        utils.sendResponse(result, req, res);
    },

    unblock: async function (req, res) {
        let result = await userBlockedServ.unblock(req.params.id, req.currUser);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await userBlockedServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },
    getDetail: async function (req, res) {
        let result = await userBlockedServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
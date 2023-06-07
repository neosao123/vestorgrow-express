const replyLikeServ = require("../services/replyLike.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await replyLikeServ.save(faq, req.currUser);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await replyLikeServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await replyLikeServ.delete(req.params.id, req.currUser);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await replyLikeServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await replyLikeServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
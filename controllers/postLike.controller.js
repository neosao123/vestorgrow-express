const likeServ = require("../services/postLike.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let data = req.body;
        let result = await likeServ.save(data, req.currUser);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await likeServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await likeServ.delete(req.params.id, req.currUser);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await likeServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await likeServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
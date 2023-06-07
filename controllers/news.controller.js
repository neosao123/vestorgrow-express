const newsServ = require("../services/News.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await newsServ.save(faq);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await newsServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await newsServ.delete(req.params.id);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await newsServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await newsServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
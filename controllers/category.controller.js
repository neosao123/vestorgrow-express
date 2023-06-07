const categoryServ = require("../services/Category.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await categoryServ.save(faq);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await categoryServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await categoryServ.delete(req.params.id);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await categoryServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await categoryServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
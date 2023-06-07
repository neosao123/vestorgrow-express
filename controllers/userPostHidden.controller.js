const userPostHiddenServ = require("../services/userPostHidden.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await userPostHiddenServ.save(faq, req.currUser);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await userPostHiddenServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await userPostHiddenServ.delete(req.params.id, req.currUser);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await userPostHiddenServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await userPostHiddenServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
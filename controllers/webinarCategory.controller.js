const webinarCategoryServ = require("../services/webinarCategory.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await webinarCategoryServ.save(faq);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await webinarCategoryServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await webinarCategoryServ.delete(req.params.id);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await webinarCategoryServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await webinarCategoryServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
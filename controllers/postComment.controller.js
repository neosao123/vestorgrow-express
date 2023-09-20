const commentServ = require("../services/postComment.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await commentServ.save(faq);
        
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await commentServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await commentServ.delete(req.params.id);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await commentServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await commentServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
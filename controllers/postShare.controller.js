const shareServ = require("../services/postShare.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let data = req.body;
        let result = await shareServ.save(data, req.currUser);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await shareServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await shareServ.delete(req.params.id, req.currUser);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await shareServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await shareServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
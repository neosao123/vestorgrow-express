const notificationServ = require("../services/Notification.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await notificationServ.save(faq);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await notificationServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await notificationServ.delete(req.params.id);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await notificationServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await notificationServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
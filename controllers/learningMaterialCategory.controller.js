const learningMaterialCategoryServ = require("../services/LearningMaterialCategory.service");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        let faq = req.body;
        let result = await learningMaterialCategoryServ.save(faq);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        let result = await learningMaterialCategoryServ.edit(req.body);
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await learningMaterialCategoryServ.delete(req.params.id);
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await learningMaterialCategoryServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await learningMaterialCategoryServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
};
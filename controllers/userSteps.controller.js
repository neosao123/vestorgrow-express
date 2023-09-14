const userSteps = require("../services/userSteps.service");
const utils = require("../utils/utils");
module.exports = {
    updateUserSuggestion: async function (req, res) {
        let result = await userSteps.updateUserSuggestion(req.params.id);
        utils.sendResponse(result, req, res);
    },
    updateGroupSuggestion: async function (req, res) {
        let result = await userSteps.updateGroupSuggestion(req.params.id);
        utils.sendResponse(result, req, res);
    },
}
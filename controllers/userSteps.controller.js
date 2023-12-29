const userSteps = require("../services/userSteps.service");
const utils = require("../utils/utils");
module.exports = {
    updateUserSuggestion: async function (req, res) {
        let result = await userSteps.updateUserSuggestion(req.params.id);
        utils.sendResponse(result, req, res);
    },
    updateGroupSuggestion: async function (req, res) {
        let result = await userSteps.updateGroupSuggestion(req.params.id, req.body.deviceId, req.body.email);
        utils.sendResponse(result, req, res);
    },
    updateStepsForAllUsers: async function (req, res) {
        let result = await userSteps.updateStepsForAllUsers(req, res);
        utils.sendResponse(result, req, res);
    },
}
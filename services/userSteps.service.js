const userStepModel = require("../models/UserSteps.model")

module.exports = {
    updateUserSuggestion: async function (id) {
        let result = {};
        try {
            result.data = await userStepModel.findOneAndUpdate({ userId: id }, { UserSuggestions: true }, { new: true })
        }
        catch (err) {
            result.err = err.message;
        }
    },
    updateGroupSuggestion: async function (id) {
        let result = {};
        try {
            result.data = await userStepModel.findOneAndUpdate({ userId: id }, { groupSuggestion: true }, { new: true })
        }
        catch (err) {
            result.err = err.message;
        }
    }
}
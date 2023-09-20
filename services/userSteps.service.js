const userStepModel = require("../models/UserSteps.model")
const User = require('../models/User.model')

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
    },
    updateStepsForAllUsers: async function (req, res) {
        let result = {}
        try {
            await userStepModel.deleteMany({});
            const users = await User.find({})
            if (users.length > 0) {
                for (let user of users) {
                    await new userStepModel({ userId: user._id, ProfileUpdates: true, UserSuggestions: true, groupSuggestion: true }).save()
                }
            }
            result.message = "user steps updated successfully";
        } catch (err) {
            result.err = err.message;
        }
        return result;
    }
}
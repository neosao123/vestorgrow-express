const userStepModel = require("../models/UserSteps.model")
const User = require('../models/User.model');
const utils = require("../utils/utils");

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
    updateGroupSuggestion: async function (id, deviceId, email) {
        let result = {};
        try {
            let usersteps = await userStepModel.findOneAndUpdate({ userId: id }, { $set: { groupSuggestion: true } }, { new: true });
            let user = await User.findById(id);
            user._doc.otpVefication = usersteps.otpVefication;
            user._doc.passwordUpdate = usersteps.passwordUpdate;
            user._doc.usernameUpdate = usersteps.usernameUpdate;
            user._doc.bioUpdate = usersteps.bioUpdate;
            user._doc.UserSuggestions = usersteps.UserSuggestions;
            user._doc.groupSuggestion = usersteps.groupSuggestion;
            user._doc.profilepictureUpdate = usersteps.profilepictureUpdate;
            result.data = user;
            result.token = utils.jwtEncode({
                emailID: email,
                userId: id,
                deviceId: deviceId,
            })
        }
        catch (err) {
            result.err = err.message;
        }
        return result;
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
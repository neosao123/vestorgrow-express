const AvatarModel = require("../models/Avatar.model");

module.exports = {
    uploadAvatar: async function (avatar) {
        let result = {};
        try {
            result.status = 200;
            result.data = await new AvatarModel(avatar).save();
        } catch (err) {
            result.status = 400;
            result.err = err.message;
        }
        return result;
    },

    getAvatar: async function () {
        let result = {};
        try {
            result.status = 200;
            result.data = await AvatarModel.find({});
            result.message = "All Avatar"
        }
        catch (error) {
            result.status = 400;
            result.err = error.message;
        }
        return result;
    }
}
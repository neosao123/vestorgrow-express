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
}
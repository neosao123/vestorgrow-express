const AvatarServ = require("../services/avatar.service");
const fs = require("fs");
const utils = require("../utils/utils");
const avatarService = require("../services/avatar.service");

module.exports = {
    uploadAvatar: async function (req, res) {
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const tmp_path = req.files[i].path;
                let rendomNumber = Math.floor(1000 + Math.random() * 9000);
                let fileExtentsion = req.files[i].originalname.split(".")
                const file_final_name =
                    `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
                const final_path =
                    process.env.BASE_PATH +
                    process.env.AVATAR_DESTINATION +
                    file_final_name;
                final_url =
                    process.env.ENDPOINT +
                    process.env.AVATAR_DESTINATION +
                    file_final_name;
                fs.rename(tmp_path, final_path, (err) => {
                    if (err) {
                        return req.files[i].fieldname + " file linking failed";
                    }
                });
                req.body[req.files[i].fieldname] = final_url;
            }
        }
        let faq = req.body;
        let result = await AvatarServ.uploadAvatar(faq);
        utils.sendResponse(result, req, res);
    },

    getAvatar: async function (req, res) {
        const result = await AvatarServ.getAvatar();
        if (result.status !== 200) {
            res.status(result.status).send(result);
        }
        else {
            delete result.status;
            res.send(result);
        }
    }
}

const bannerServ = require("../services/banner.service");
const fs = require("fs");
const utils = require("../utils/utils");

module.exports = {
    add: async function (req, res) {
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const tmp_path = req.files[i].path;
                let rendomNumber = Math.floor(1000 + Math.random() * 9000);
                let fileExtentsion = req.files[i].originalname.split(".")
                const file_final_name =
                    `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
                const final_path =
                    process.env.BASE_PATH +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                final_url =
                    process.env.ENDPOINT +
                    process.env.IMAGE_DESTINATION +         
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
        let result = await bannerServ.add(faq, req.currUser);
        utils.sendResponse(result, req, res);
    },

    edit: async function (req, res) {
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const tmp_path = req.files[i].path;
                let rendomNumber = Math.floor(1000 + Math.random() * 9000);
                let fileExtentsion = req.files[i].originalname.split(".")
                const file_final_name =
                    `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
                const final_path =
                    process.env.BASE_PATH +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                final_url =
                    process.env.ENDPOINT +
                    process.env.IMAGE_DESTINATION +
                    file_final_name;
                fs.rename(tmp_path, final_path, (err) => {
                    if (err) {
                        return req.files[i].fieldname + " file linking failed";
                    }
                });
                req.body[req.files[i].fieldname] = final_url;
            }
        }
        let oldData = await bannerServ.getDetail(req.body._id);
        let result = await bannerServ.edit(req.body);
        if (result) {
            utils.deleteOldFile(oldData.data.banner_image, req.body.banner_image)
        }
        utils.sendResponse(result, req, res);
    },

    delete: async function (req, res) {
        let result = await bannerServ.delete(req.params.id);
        if (result.toBeDeleted && result.toBeDeleted.length > 0) {
            utils.deleteFile(result.toBeDeleted)
            delete result.toBeDeleted
        }
        utils.sendResponse(result, req, res);
    },

    listAll: async function (req, res) {
        let result = await bannerServ.listAll(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },

    getDetail: async function (req, res) {
        let result = await bannerServ.getDetail(req.params.id);
        utils.sendResponse(result, req, res);
    },
    changeActive: async function (req, res) {
        let result = await bannerServ.changeActive(req.body, req.currUser);
        utils.sendResponse(result, req, res);
    },
};

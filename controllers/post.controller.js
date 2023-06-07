const postServ = require("../services/post.service");
const fs = require("fs");
const utils = require("../utils/utils");

module.exports = {
  add: async function (req, res) {
    if (req.files && req.files.length > 0) {
      let files = [];
      for (let i = 0; i < req.files.length; i++) {
        const tmp_path = req.files[i].path;
        let rendomNumber = Math.floor(1000 + Math.random() * 9000);
        let fileExtentsion = req.files[i].originalname.split(".");
        const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
        const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
        final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
        fs.rename(tmp_path, final_path, (err) => {
          if (err) {
            return req.files[i].fieldname + " file linking failed";
          }
        });
        files = [...files, final_url];
      }
      req.body[req.files[0].fieldname] = files;
    }
    let faq = req.body;
    let result = await postServ.add(faq, req.currUser);
    utils.sendResponse(result, req, res);
  },

  edit: async function (req, res) {
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const tmp_path = req.files[i].path;
        let rendomNumber = Math.floor(1000 + Math.random() * 9000);
        let fileExtentsion = req.files[i].originalname.split(".");
        const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
        const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
        final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
        fs.rename(tmp_path, final_path, (err) => {
          if (err) {
            return req.files[i].fieldname + " file linking failed";
          }
        });
        req.body[req.files[i].fieldname] = final_url;
      }
    }
    let oldData = await postServ.getDetail(req.body._id);
    let result = await postServ.edit(req.body);
    if (result) {
      oldData.mediaFiles.forEach((element, idx) => {
        utils.deleteOldFile(element, req.body.mediaFiles[idx]);
      });
    }
    utils.sendResponse(result, req, res);
  },

  delete: async function (req, res) {
    let result = await postServ.delete(req.params.id);
    if (result.toBeDeleted && result.toBeDeleted.length > 0) {
      utils.deleteFile(result.toBeDeleted);
      delete result.toBeDeleted;
    }
    utils.sendResponse(result, req, res);
  },

  listAll: async function (req, res) {
    let result = await postServ.listAll(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  getDetail: async function (req, res) {
    let result = await postServ.getDetail(req.params.id, req.currUser);
    utils.sendResponse(result, req, res);
  },
  sharePost: async function (req, res) {
    let result = await postServ.sharePost(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },
  sharePostList: async function (req, res) {
    let result = await postServ.sharePostList(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },
};

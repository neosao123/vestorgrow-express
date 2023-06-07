const testimonialService = require("../services/testimonial.service");
const utils = require("../utils/utils");
const fs = require("fs");

module.exports = {
  add: async function (req, res) {
    if (req.files && req.files.length > 0) {
      const tmp_path = req.files[0].path;
      let rendomNumber = Math.floor(1000 + Math.random() * 9000);
      let fileExtentsion = req.files[0].originalname.split(".");
      const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
      const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
      const final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
      fs.rename(tmp_path, final_path, (err) => {
        if (err) {
          return req.files[0].fieldname + " file linking failed";
        }
      });
      req.body[req.files[0].fieldname] = final_url;
    }
    let data = req.body;
    let result = await testimonialService.add(data, req.currUser);
    utils.sendResponse(result, req, res);
  },

  listAll: async function (req, res) {
    let result = await testimonialService.listAll(req.body);
    utils.sendResponse(result, req, res);
  },

  update: async function (req, res) {
    if (req.files && req.files.length > 0) {
      const tmp_path = req.files[0].path;
      let rendomNumber = Math.floor(1000 + Math.random() * 9000);
      let fileExtentsion = req.files[0].originalname.split(".");
      const file_final_name = `${new Date().getTime()}${rendomNumber}.${fileExtentsion[fileExtentsion.length - 1]}`;
      const final_path = process.env.BASE_PATH + process.env.IMAGE_DESTINATION + file_final_name;
      const final_url = process.env.ENDPOINT + process.env.IMAGE_DESTINATION + file_final_name;
      fs.rename(tmp_path, final_path, (err) => {
        if (err) {
          return req.files[0].fieldname + " file linking failed";
        }
      });
      req.body[req.files[0].fieldname] = final_url;
    }
    let oldData = await testimonialService.getDetail(req.body._id);
    let result = await testimonialService.update(req.body);
    if (result) {
      utils.deleteOldFile(oldData.image, req.body.image);
    }
    utils.sendResponse(result, req, res);
  },

  getDetail: async function (req, res) {
    let result = await testimonialService.getDetail(req.params.id);
    utils.sendResponse(result, req, res);
  },

  delete: async function (req, res) {
    let result = await testimonialService.delete(req.params.id);
    if (result.result.toBeDeleted) {
      utils.deleteFile(result.result.toBeDeleted);
      delete result.result.toBeDeleted;
    }
    utils.sendResponse(result, req, res);
  },
};

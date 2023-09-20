const { chat } = require("googleapis/build/src/apis/chat");
const chatServ = require("../services/Chat.service");
const utils = require("../utils/utils");
const fs = require("fs");

module.exports = {
  add: async function (req, res) {
    if (req.body.chatKeyword) {
      req.body.chatKeyword = JSON.parse(req.body.chatKeyword);
    }
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
    let body = req.body;
    let result = await chatServ.save(body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  edit: async function (req, res) {
    if (req.body.chatKeyword) {
      req.body.chatKeyword = JSON.parse(req.body.chatKeyword);
    }
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
    let body = req.body;
    let result = await chatServ.edit(req.body);
    utils.sendResponse(result, req, res);
  },

  joinGroup: async function (req, res) {
    let result = await chatServ.joinGroup(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  leaveGroup: async function (req, res) {
    let result = await chatServ.leaveGroup(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  removeFromGroup: async function (req, res) {
    let result = await chatServ.removeFromGroup(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  delete: async function (req, res) {
    let result = await chatServ.delete(req.params.id);
    if (result.toBeDeleted && result.toBeDeleted.length > 0) {
      utils.deleteFile(result.toBeDeleted);
      delete result.toBeDeleted;
    }
    utils.sendResponse(result, req, res);
  },

  deleteChat: async function (req, res) {
    let result = await chatServ.deleteChat(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  listAll: async function (req, res) {
    let result = await chatServ.listAll(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  profileChatGroupList: async function (req, res) {
    let result = await chatServ.profileChatGroupList(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  searchGroup: async function (req, res) {
    let result = await chatServ.searchGroup(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  getDetail: async function (req, res) {
    let result = await chatServ.getDetail(req.params.id);
    utils.sendResponse(result, req, res);
  },

  getDetailMemberList: async function (req, res) {
    let result = await chatServ.getDetailMemberList(req.params.id);
    utils.sendResponse(result, req, res);
  },

  listInvitation: async function (req, res) {
    let result = await chatServ.listInvitation(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  sendInvitation: async function (req, res) {
    let result = await chatServ.sendInvitation(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  userInvitation: async function (req, res) {
    let result = await chatServ.userInvitation(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  deleteInvitation: async function (req, res) {
    let result = await chatServ.deleteInvitation(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  makeAdmin: async function (req, res) {
    let result = await chatServ.makeAdmin(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },
  acceptInvitationLink: async function (req, res) {
    let result = await chatServ.acceptInvitationLink(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },
  suggestGroup: async function (req, res) {
    let result = await chatServ.suggestGroup(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },

  TotalUnReadCount: async function (req, res) {
    let result = await chatServ.TotalUnReadCount(req.currUser)
    utils.sendResponse(result, req, res)
  },

  AddColors: async function (req, res) {
    let result = await chatServ.AddColors()
    utils.sendResponse(result, req, res)
  },

  getPersonalChatByMembers: async function (req, res) {
    let result = await chatServ.getPersonalChatByMembers(req.body.memberId, req.currUser);
    utils.sendResponse(result, req, res);
  }
};

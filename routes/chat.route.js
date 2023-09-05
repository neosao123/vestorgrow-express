const router = require("express").Router();
const auth = require("../middleware/auth");
const chatController = require("../controllers/chat.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const path = require("path");
const multer = require("multer");
const ChatService = require("../services/Chat.service");

const upload = multer({
  dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "chatLogo" }];

router
  .route("/")
  .post(auth, adminUserFreeCheckPermission.postAuth, upload.any(fields), chatController.add)
  .put(auth, adminUserFreeCheckPermission.putAuth, upload.any(fields), chatController.edit);
router
  .route("/:id")
  .get(auth, adminUserFreeCheckPermission.getDetailAuth, chatController.getDetail)
  .delete(auth, adminUserFreeCheckPermission.deleteAuth, chatController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, chatController.listAll);
router.route("/searchgroup").post(auth, adminUserFreeCheckPermission.listAllAuth, chatController.searchGroup);
router.route("/delete").post(auth, adminUserFreeCheckPermission.putAuth, chatController.deleteChat);
router.route("/joingroup").post(auth, adminUserFreeCheckPermission.putAuth, chatController.joinGroup);
router.route("/removefromgroup").post(auth, adminUserFreeCheckPermission.putAuth, chatController.removeFromGroup);
router.route("/leavegroup").post(auth, adminUserFreeCheckPermission.putAuth, chatController.leaveGroup);
router.route("/sendinvitation").post(auth, adminUserFreeCheckPermission.putAuth, chatController.sendInvitation);
router.route("/userinvitation").post(auth, adminUserFreeCheckPermission.putAuth, chatController.userInvitation);
router.route("/listinvitation").post(auth, adminUserFreeCheckPermission.putAuth, chatController.listInvitation);
router.route("/deleteinvitation").post(auth, adminUserFreeCheckPermission.putAuth, chatController.deleteInvitation);
router.route("/makeadmin").post(auth, adminUserFreeCheckPermission.putAuth, chatController.makeAdmin);
router
  .route("/acceptinvitationlink")
  .post(auth, adminUserFreeCheckPermission.putAuth, chatController.acceptInvitationLink);
router.route("/memberDetail/:id").get(auth, chatController.getDetailMemberList);
router.route("/suggest/group").post(auth, chatController.suggestGroup);
router.route("/totalunreadcount").post(auth, chatController.TotalUnReadCount)
module.exports = router;

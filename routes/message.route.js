const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const messageController = require("../controllers/message.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserPaidCheckPermission = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const multer = require("multer");

const upload = multer({
  dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "file" }];

router
  .route("/")
  .post(auth, adminUserFreeCheckPermission.postAuth, upload.any(fields), messageController.add)
  .put(auth, adminUserFreeCheckPermission.putAuth, upload.any(fields), messageController.edit);
router
  .route("/:id")
  .get(auth, adminUserFreeCheckPermission.getDetailAuth, messageController.getDetail)
  .delete(auth, adminUserFreeCheckPermission.deleteAuth, messageController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, messageController.listAll);
router.route("/delete").post(auth, adminUserFreeCheckPermission.listAllAuth, messageController.deleteMessage);
router
  .route("/compose")
  .post(auth, adminUserFreeCheckPermission.listAllAuth, upload.any(fields), messageController.composeMessage);
router
  .route("/compose/new")
  .post(auth, adminUserFreeCheckPermission.listAllAuth, upload.any(fields), messageController.composeNewMessage);
module.exports = router;

const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const globalMessageController = require("../controllers/globalMessage.controller");
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
  .post(auth, adminUserPaidCheckPermission.postAuth, upload.any(fields), globalMessageController.add)
  .put(auth, adminUserPaidCheckPermission.putAuth, upload.any(fields), globalMessageController.edit);
router
  .route("/:id")
  .get(auth, adminUserPaidCheckPermission.getDetailAuth, globalMessageController.getDetail)
  .delete(auth, adminUserPaidCheckPermission.deleteAuth, globalMessageController.delete);
router.route("/list").post(auth, adminUserPaidCheckPermission.listAllAuth, globalMessageController.listAll);
router.route("/delete").post(auth, adminUserPaidCheckPermission.listAllAuth, globalMessageController.deleteMessage);
router.route("/markasread").post(auth, adminUserPaidCheckPermission.listAllAuth, globalMessageController.markAsRead);
module.exports = router;

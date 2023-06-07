const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const userController = require("../controllers/user.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserPaidCheckPermission = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const multer = require("multer");

const upload = multer({
  dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "profile_img" }, { name: "cover_img" }];

router
  .route("/")
  .post(upload.any(fields), userController.add)
  .put(auth, adminUserFreeCheckPermission.putAuth, upload.any(fields), userController.edit);
router.route("/setting").post(auth, adminUserFreeCheckPermission.postAuth, userController.editSetting);
router
  .route("/:id")
  .get(auth, userController.getDetail)
  .delete(auth, adminUserFreeCheckPermission.deleteAuth, userController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, userController.listAll);
router.route("/sessionlist").post(auth, adminUserFreeCheckPermission.listAllAuth, userController.sessionList);
router.route("/login").post(userController.login);
router.route("/otplogin").post(userController.otpLogin);
router.route("/logout").post(userController.logout);
router.route("/forgot").post(userController.forgetPassword);
router.route("/sendactivationlink").post(userController.signupActiveLink);
router.route("/addprofile").post(upload.any(fields), userController.addProfile);
router.route("/reset").post(userController.resetPassword);
router.route("/getsearchdata").post(auth, userController.getSearchData);
router.route("/firstview").post(auth, adminUserFreeCheckPermission.putAuth, userController.editFirstView);
router.route("/updateonlinestatus").post(auth, adminUserFreeCheckPermission.putAuth, userController.updateOnlineStatus);
router.route("/getonlinestatus").post(auth, adminUserFreeCheckPermission.putAuth, userController.getOnlineStatus);
//mention users api 
router.route("/mention").post(auth, userController.mentionUsers);
router.route("/most/followed/list").post(auth, userController.mostFollowedUsers);

module.exports = router;

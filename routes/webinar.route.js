const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const webinarController = require("../controllers/webinar.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserPaidCheckPermission = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const multer = require("multer");

const upload = multer({
    dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "video" }, { name: "banner_image" }];

router
    .route("/")
    .post(auth,
        adminCheckPermission.postAuth,
        upload.any(fields),
        webinarController.add)
    .put(
        auth,
        adminCheckPermission.putAuth,
        upload.any(fields),
        webinarController.edit
    );
router.route("/:id")
    .get(auth, adminUserPaidCheckPermission.getDetailAuth, webinarController.getDetail)
    .delete(auth, adminCheckPermission.deleteAuth, webinarController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, webinarController.listAll);
router.route("/active")
    .put(auth,
        adminCheckPermission.putAuth,
        webinarController.changeActive
    )
module.exports = router
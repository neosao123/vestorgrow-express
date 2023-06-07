const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const bannerController = require("../controllers/banner.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserPaidCheckPermission = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const multer = require("multer");

const upload = multer({
    dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "banner_image" }];

router
    .route("/")
    .post(auth,
        adminCheckPermission.postAuth,
        upload.any(fields),
        bannerController.add)
    .put(
        auth,
        adminCheckPermission.putAuth,
        upload.any(fields),
        bannerController.edit
    );
router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, bannerController.getDetail)
    .delete(auth, adminCheckPermission.deleteAuth, bannerController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, bannerController.listAll);
router.route("/active")
    .put(auth,
        adminCheckPermission.putAuth,
        bannerController.changeActive
    )
module.exports = router
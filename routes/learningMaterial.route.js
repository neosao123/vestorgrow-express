const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const learningMaterialController = require("../controllers/learningMaterial.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserPaidCheckPermission = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const multer = require("multer");

const upload = multer({
    dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "cover_image" }, { name: "banner_image" }];

router
    .route("/")
    .post(auth,
        adminCheckPermission.postAuth,
        upload.any(fields),
        learningMaterialController.add)
    .put(
        auth,
        adminCheckPermission.putAuth,
        upload.any(fields),
        learningMaterialController.edit
    );
router.route("/getpdf/:id")
    .get(auth, adminUserPaidCheckPermission.getDetailAuth, learningMaterialController.getPdf)
router.route("/:id")
    .get(auth, adminUserPaidCheckPermission.getDetailAuth, learningMaterialController.getDetail)
    .delete(auth, adminCheckPermission.deleteAuth, learningMaterialController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, learningMaterialController.listAll);
router.route("/active")
    .put(auth,
        adminCheckPermission.putAuth,
        learningMaterialController.changeActive
    )
module.exports = router
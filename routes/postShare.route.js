const router = require("express").Router();
const auth = require("../middleware/auth");
const shareController = require("../controllers/postShare.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        shareController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        shareController.edit);

router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, shareController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, shareController.delete);

router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, shareController.listAll);


module.exports = router
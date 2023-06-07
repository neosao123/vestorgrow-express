const router = require("express").Router();
const auth = require("../middleware/auth");
const userPostHiddenController = require("../controllers/userPostHidden.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        userPostHiddenController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        userPostHiddenController.edit);

router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, userPostHiddenController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, userPostHiddenController.delete);

router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, userPostHiddenController.listAll);


module.exports = router
const router = require("express").Router();
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notification.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        notificationController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        notificationController.edit);
router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, notificationController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, notificationController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, notificationController.listAll);


module.exports = router
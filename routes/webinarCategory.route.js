const router = require("express").Router();
const auth = require("../middleware/auth");
const webinarCategoryController = require("../controllers/webinarCategory.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminCheckPermission.postAuth,
        webinarCategoryController.add)
    .put(
        auth,
        adminCheckPermission.putAuth,
        webinarCategoryController.edit);
router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, webinarCategoryController.getDetail)
    .delete(auth, adminCheckPermission.deleteAuth, webinarCategoryController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, webinarCategoryController.listAll);


module.exports = router
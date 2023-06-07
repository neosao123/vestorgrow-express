const router = require("express").Router();
const auth = require("../middleware/auth");
const categoryController = require("../controllers/category.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminCheckPermission.postAuth,
        categoryController.add)
    .put(
        auth,
        adminCheckPermission.putAuth,
        categoryController.edit);
router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, categoryController.getDetail)
    .delete(auth, adminCheckPermission.deleteAuth, categoryController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, categoryController.listAll);


module.exports = router
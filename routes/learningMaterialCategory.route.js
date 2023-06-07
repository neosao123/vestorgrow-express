const router = require("express").Router();
const auth = require("../middleware/auth");
const lmCategoryController = require("../controllers/learningMaterialCategory.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminCheckPermission.postAuth,
        lmCategoryController.add)
    .put(
        auth,
        adminCheckPermission.putAuth,
        lmCategoryController.edit);
router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, lmCategoryController.getDetail)
    .delete(auth, adminCheckPermission.deleteAuth, lmCategoryController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, lmCategoryController.listAll);


module.exports = router
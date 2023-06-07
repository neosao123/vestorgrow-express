const router = require("express").Router();
const auth = require("../middleware/auth");
const reportPostController = require("../controllers/reportPost.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        reportPostController.add)
//     .put(
//         auth,
//         adminCheckPermission.putAuth,
//         reportPostController.edit);
// router.route("/:id")
//     .get(auth, adminUserFreeCheckPermission.getDetailAuth, reportPostController.getDetail)
//     .delete(auth, adminCheckPermission.deleteAuth, reportPostController.delete);
// router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, reportPostController.listAll);


module.exports = router
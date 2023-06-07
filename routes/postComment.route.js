const router = require("express").Router();
const auth = require("../middleware/auth");
const commentController = require("../controllers/postComment.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        commentController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        commentController.edit);

router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, commentController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, commentController.delete);

router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, commentController.listAll);


module.exports = router
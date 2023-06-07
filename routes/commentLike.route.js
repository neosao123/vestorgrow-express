const router = require("express").Router();
const auth = require("../middleware/auth");
const commentLikeController = require("../controllers/commentLike.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        commentLikeController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        commentLikeController.edit);

router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, commentLikeController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, commentLikeController.delete);

router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, commentLikeController.listAll);


module.exports = router
const router = require("express").Router();
const auth = require("../middleware/auth");
const replyLikeController = require("../controllers/replyLike.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        replyLikeController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        replyLikeController.edit);

router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, replyLikeController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, replyLikeController.delete);

router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, replyLikeController.listAll);


module.exports = router
const router = require("express").Router();
const auth = require("../middleware/auth");
const likeController = require("../controllers/postLike.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");

router
  .route("/")
  .post(auth, adminUserFreeCheckPermission.postAuth, likeController.add)
  .put(auth, adminUserFreeCheckPermission.putAuth, likeController.edit);

router
  .route("/:id")
  .get(auth, adminUserFreeCheckPermission.getDetailAuth, likeController.getDetail)
  .delete(auth, adminUserFreeCheckPermission.deleteAuth, likeController.delete);

router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, likeController.listAll);

router.route("/update/type").get(likeController.updateAllType);

router.route("/posts/reactions").post(auth, likeController.getPostUniqueReactions);

module.exports = router;

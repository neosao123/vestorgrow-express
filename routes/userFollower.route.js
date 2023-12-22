const router = require("express").Router();
const userFollowerController = require("../controllers/userFollower.controller");
const auth = require("../middleware/auth");
const adminAccess = require("../middleware/accessValidator/adminAccess");
const adminUserPaidAccess = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeAccess = require("../middleware/accessValidator/adminUserFreeAccess");

router.route("/").post(auth, adminUserFreeAccess.postAuth, userFollowerController.add);

router.route("/list").post(auth, userFollowerController.listAll);
router.route("/list/:id").post(auth, userFollowerController.listAllOther);
router.route("/isfollowing").post(auth, userFollowerController.isFollowing);

//temp follower
router.route("/req").post(auth, adminUserFreeAccess.postAuth, userFollowerController.sendReq);
router.route("/reqtofollow").post(userFollowerController.sendReqtoFollow);
router.route("/req/list").post(auth, userFollowerController.listAllReq);
router.route("/sentreq/list").post(auth, userFollowerController.listAllSentReq);
router.route("/friends/list").post(auth, userFollowerController.listAllFriends);
router.route("/req/:id").delete(auth, adminUserFreeAccess.deleteAuth, userFollowerController.rejectReq);

router
  .route("/:id")
  .delete(auth, adminUserFreeAccess.deleteAuth, userFollowerController.unfollow)
  .get(userFollowerController.getDetail);
router.route("/req/list/delete").post(userFollowerController.deleteReq);

router.route("/req/remove/request").post(auth, adminUserFreeAccess.postAuth, userFollowerController.deleteNotification);

module.exports = router;

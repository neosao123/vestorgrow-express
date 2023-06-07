const router = require("express").Router();
const userBlockedController = require("../controllers/userBlocked.controller");
const auth = require("../middleware/auth");
const adminAccess = require("../middleware/accessValidator/adminAccess");
const adminUserPaidAccess = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeAccess = require("../middleware/accessValidator/adminUserFreeAccess");

router
    .route("/")
    .post(auth, adminUserFreeAccess.postAuth, userBlockedController.add)

router.route("/list").post(auth, userBlockedController.listAll);
router
    .route("/:id")
    .delete(auth, adminUserFreeAccess.deleteAuth, userBlockedController.unblock)
    .get(userBlockedController.getDetail);

module.exports = router;

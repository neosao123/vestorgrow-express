const router = require("express").Router();
const auth = require("../middleware/auth");
const newsController = require("../controllers/news.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");


router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        newsController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        newsController.edit);
router.route("/:id")
    .get(auth, adminUserFreeCheckPermission.getDetailAuth, newsController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, newsController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, newsController.listAll);


module.exports = router
const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const postController = require("../controllers/post.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserPaidCheckPermission = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const multer = require("multer");

const upload = multer({
    dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "mediaFiles" }];

router
    .route("/")
    .post(auth,
        adminUserFreeCheckPermission.postAuth,
        upload.any(fields),
        postController.add)
    .put(
        auth,
        adminUserFreeCheckPermission.putAuth,
        upload.any(fields),
        postController.edit
    );
router.route("/:id")
    .get(postController.getDetail)
    .delete(auth, adminUserFreeCheckPermission.deleteAuth, postController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, postController.listAll);

// routes for sharepost
router.route("/share").post(auth, adminUserFreeCheckPermission.postAuth, postController.sharePost);
router.route("/share/list").post(auth, postController.sharePostList);
router.route("/new/list").post(auth, postController.newPostList);
router.route("/my/feed").post(auth, postController.myFeed);
module.exports = router
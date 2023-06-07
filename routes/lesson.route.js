const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const lessonController = require("../controllers/lesson.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const adminUserPaidCheckPermission = require("../middleware/accessValidator/adminUserPaidAccess");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");
const multer = require("multer");

const upload = multer({
    dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "cover_image" }, { name: "banner_image" }, { name: "lesson_video" }, { name: "lesson_cover" }];

router
    .route("/")
    .post(auth,
        adminCheckPermission.postAuth,
        upload.any(fields),
        lessonController.add)
    .put(
        auth,
        adminCheckPermission.putAuth,
        upload.any(fields),
        lessonController.edit
    );
router.route("/topic")
    .post(auth,
        adminCheckPermission.postAuth,
        lessonController.addTopic
    )
router.route("/subtopic")
    .post(auth,
        adminCheckPermission.postAuth,
        lessonController.addSubTopic
    )
router.route("/lesson")
    .post(auth,
        adminCheckPermission.postAuth,
        upload.any(fields),
        lessonController.addLesson
    )
router.route("/active")
    .put(auth,
        adminCheckPermission.putAuth,
        lessonController.changeActive
    )
router.route("/lesson/delete")
    .post(auth,
        adminCheckPermission.deleteAuth,
        lessonController.deleteLesson)
router.route("/subtopic/delete")
    .post(auth,
        adminCheckPermission.deleteAuth,
        lessonController.deleteSubTopic)
router.route("/topic/delete")
    .post(auth,
        adminCheckPermission.deleteAuth,
        lessonController.deleteTopic)
router.route("/:id")
    .get(auth, adminUserPaidCheckPermission.getDetailAuth, lessonController.getDetail)
    .delete(auth, adminCheckPermission.deleteAuth, lessonController.delete);
router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, lessonController.listAll);
module.exports = router
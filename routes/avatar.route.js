const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const AvatarController = require("../controllers/avatar.controller");
const avatarController = require("../controllers/avatar.controller");

const upload = multer({
    dest: path.join(__dirname, "../uploads/temp"),
});

const fields = [{ name: "avatar" }];


router.route("/upload")
    .post(upload.any(fields), AvatarController.uploadAvatar);
router.route("/getall")
    .get(avatarController.getAvatar);

module.exports = router;
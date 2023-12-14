const express = require("express");
const router = express.Router();
const path = require("path");
const auth = require("../middleware/auth");
const discoverController = require("../controllers/discover.controller");
const adminUserFreeCheckPermission = require("../middleware/accessValidator/adminUserFreeAccess");

router.route("/:id").get(auth, adminUserFreeCheckPermission.listAllAuth, discoverController.getDetail);

router.route("/list").post(auth, adminUserFreeCheckPermission.listAllAuth, discoverController.listAll);
router.route("/listPublic").post(discoverController.listAllPublic);

router.route("/popular/keywords").post(discoverController.listPopularTags);

module.exports = router;

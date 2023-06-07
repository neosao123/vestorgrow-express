const express = require("express");
const router = express.Router();
const path = require("path");
const testimonialController = require("../controllers/testimonial.controller");
const adminCheckPermission = require("../middleware/accessValidator/adminAccess");
const auth = require("../middleware/auth");

const multer = require("multer");

const upload = multer({
  dest: path.join(__dirname, "uploads/temp"),
});

const fields = [{ name: "image" }];

router
  .route("/")
  .post(auth, adminCheckPermission.postAuth, upload.any(fields), testimonialController.add)
  .put(auth, adminCheckPermission.putAuth, upload.any(fields), testimonialController.update);
router.route("/list").post(testimonialController.listAll);
router
  .route("/:id")
  .get(testimonialController.getDetail)
  .delete(auth, adminCheckPermission.deleteAuth, testimonialController.delete);

module.exports = router;

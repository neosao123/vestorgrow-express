const router = require("express").Router();
const appleUserController = require("../controllers/appleUser.controller")
const path = require("path")
const multer = require("multer")
const upload = multer({
    dest: path.join(__dirname, "../uploads/temp"),
  });
router.post("/add_apple_user",upload.any(), appleUserController.add);
router.get("/get_apple_user", appleUserController.getById);


module.exports = router
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
const fileType = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const fileFilter = (req, file, callback) => {
  if (fileType.includes(file.mimetype)) {
    callback(null, true);
  } else {
    const error = new Error("Not a valid format");
    error.status = 400;
    callback(error, false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, `.${process.env.IMAGE_DESTINATION}`);
  },
  filename: (req, file, callback) => {
    let randomNumber = Math.floor(1000 + Math.random() * 9000);
    const file_name = `${new Date().getTime()}${randomNumber}`;
    callback(null, file_name + path.extname(file.originalname));
  },
});

const uploadProfileImage = multer({
  storage,
  fileFilter,
  // limits: {
  //   fileSize: 1 * 1024 * 1024, // Limiting file size to 1MB
  // },
}).any();

const uploadMobileUserImg = (req, res, next) => {
  uploadProfileImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ err: err.message });
    } else if (err) {
      return res.status(err.status || 500).json({ err: err.message });
    }
    next();
  });
};

const upload = multer();

const mobileUserController = require("../controllers/mobileUser.controller");
const auth = require("../middleware/auth");
router.post("/create-account",upload.any(), mobileUserController.add);
router.post("/change-email", auth, upload.any(), mobileUserController.changeEmail);
router.post("/verify-email", auth, upload.any(), mobileUserController.verifyEmail);
router.post("/create-password", auth, upload.any(), mobileUserController.addPassword);
router.put("/update-username", auth, upload.any(), mobileUserController.update_username);
router.put("/update-profile", auth, uploadMobileUserImg, mobileUserController.updateProfileImg);
router.put("/update-bio", auth, upload.any(), mobileUserController.updateBio)
router.get("/resend-otp", auth, mobileUserController.resendOtp)
router.post("/social-login",upload.any(), mobileUserController.socialLogin)
router.post("/login",upload.any(), mobileUserController.login)
router.post("/forgotPassword",upload.any(), mobileUserController.forgotPassword)
router.post("/get-user-suggestion",auth,upload.any(), mobileUserController.getUserSuggestion)
router.get("/get-avatar-images",mobileUserController.getAvatarImages)
module.exports = router;

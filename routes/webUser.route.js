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

const webUserController = require("../controllers/webuser.controller");
const auth = require("../middleware/auth");
const webuserController = require("../controllers/webuser.controller");
router.post("/create-account", upload.any(), webUserController.add);
router.post("/verify-email", upload.any(), webUserController.emailVerification);
router.post("/resend-email", webUserController.resendemailverificationOTP);
router.post("/password-update", webUserController.passwordUpdate);
router.post("/update-username", webUserController.update_username);
router.post("/change-email", webUserController.change_email);
router.post("/update-bio", webUserController.update_Bio);
router.post("/update-profileimage", webUserController.update_ProfileImage);
router.post("/google_signup", webuserController.signup_Google);
router.post("/update_password_auth", webuserController.update_Password_auth);
router.post("/skip_onboardingsteps",webuserController.skip_onboardingsteps);
module.exports = router;

const mongoose = require("mongoose");

const userLoginSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        auth_token: {
            type: String,
        },
        device_id: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
        device: {
            type: String,
        },
        deviceType: {
            type: String,
        },
        browser: {
            type: String,
        },
        os: {
            type: String,
        },
        isLogin: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);

let UserLogin = mongoose.model("UserLogin", userLoginSchema);
module.exports = UserLogin;
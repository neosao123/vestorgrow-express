const mongoose = require("mongoose");

const userOtpSchema = mongoose.Schema(
    {
        email: {
            type: String,
        },
        otp: {
            type: Number,
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);

let UserOtp = mongoose.model("UserOtp", userOtpSchema);
module.exports = UserOtp;
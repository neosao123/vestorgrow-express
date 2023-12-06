const mongoose = require("mongoose");

const updatePasswordOtpSchema = mongoose.Schema(
    {
        email: {
            type: String,
        },
        username: {
            type: String,
        },
        otp: {
            type: Number,
        },
    },
    { timestamps: { createdAt: "createdAt" }, versionKey: false }
);

let OtpPasswordUpdate = mongoose.model("OtpPasswordUpdate", updatePasswordOtpSchema);
module.exports = OtpPasswordUpdate;
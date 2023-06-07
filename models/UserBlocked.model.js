const mongoose = require("mongoose");

const UserBlockedSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        blockedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);

let UserBlocked = mongoose.model("UserBlocked", UserBlockedSchema);
module.exports = UserBlocked;
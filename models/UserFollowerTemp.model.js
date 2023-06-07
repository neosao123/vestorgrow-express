const mongoose = require("mongoose");

const UserFollowerSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        followingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        requested: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: { createdAt: "createdAt" } }
);

let UserFollowerTemp = mongoose.model("UserFollowerTemp", UserFollowerSchema);
module.exports = UserFollowerTemp;
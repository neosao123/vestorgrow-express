const mongoose = require("mongoose");

const UserFollowerSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        followingId: {
            type: mongoose.Schema.Types.ObjectId, //user is following this followingId
            ref: "User",
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);

let UserFollower = mongoose.model("UserFollower", UserFollowerSchema);
module.exports = UserFollower;
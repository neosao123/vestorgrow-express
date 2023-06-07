const mongoose = require("mongoose");

const userPostHidden_schema = mongoose.Schema(
    {

        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let UserPostHidden = mongoose.model("UserPostHidden", userPostHidden_schema);
module.exports = UserPostHidden;
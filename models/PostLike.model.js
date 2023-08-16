const mongoose = require("mongoose");

const postLike_schema = mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            default: "like"
        }
    },
    { timestamps: { createdAt: "createdAt" } }
);
let PostLike = mongoose.model("PostLike", postLike_schema);
module.exports = PostLike;
const mongoose = require("mongoose");

const commentLike_schema = mongoose.Schema(
    {
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let CommentLike = mongoose.model("CommentLike", commentLike_schema);
module.exports = CommentLike;
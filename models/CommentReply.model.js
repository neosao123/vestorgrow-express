const mongoose = require("mongoose");

const commentReply_schema = mongoose.Schema(
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
        reply: {
            type: String
        },
        likeCount: {
            type: Number,
            default: 0
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let CommentReply = mongoose.model("CommentReply", commentReply_schema);
module.exports = CommentReply;
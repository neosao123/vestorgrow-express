const mongoose = require("mongoose");

const replyLike_schema = mongoose.Schema(
    {
        replyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reply",
        },
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
let ReplyLike = mongoose.model("ReplyLike", replyLike_schema);
module.exports = ReplyLike;
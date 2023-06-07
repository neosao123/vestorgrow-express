const mongoose = require("mongoose");

const postComment_schema = mongoose.Schema(
    {

        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        comment: {
            type: String
        },
        likeCount: {
            type: Number,
            default: 0
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let PostComment = mongoose.model("Comment", postComment_schema);
module.exports = PostComment;
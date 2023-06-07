const mongoose = require("mongoose");

const postComment_schema = mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        sharedTo:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    { timestamps: { createdAt: "createdAt" } }
);
let PostComment = mongoose.model("PostShare", postComment_schema);
module.exports = PostComment;
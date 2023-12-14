const mongoose = require("mongoose");

const post_schema = mongoose.Schema(
    {
        originalPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        parentPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        message: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        mediaFiles: {
            type: [{
                type: String,
            }],
        },
        shareType: {
            type: String
        },
        likeCount: {
            type: Number,
            default: 0
        },
        shareCount: {
            type: Number,
            default: 0
        },
        commentCount: {
            type: Number,
            default: 0
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        is_hidden: {
            type: Boolean,
            default: false,
        },
        lastActivityDate: {
            type: Date
        },
        postKeywords: {
            type: [String],
            default: []
        },
        mediaType: {
            type: String,
            default: ""
        }
        ,
        category: {
            type: String,
            default: "financial"
        }
    },
    { timestamps: { createdAt: "createdAt" } }
);
let Post = mongoose.model("Post", post_schema);
module.exports = Post;
const mongoose = require("mongoose");

const news_schema = mongoose.Schema(
    {
        title: {
            type: String,
        },
        desc: {
            type: String,
        },
        link: {
            type: String,
        },
        type: {
            type: String,
        },
        is_active: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    { timestamps: { createdAt: "createdAt" } }
);
let News = mongoose.model("News", news_schema);
module.exports = News;
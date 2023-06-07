const mongoose = require("mongoose");

const banner_schema = mongoose.Schema(
    {
        location: {
            type: String
        },
        title: {
            type: String
        },
        subTitle: {
            type: String
        },
        link: {
            type: String
        },
        linkName: {
            type: String
        },
        banner_image: {
            type: String
        },
        is_active: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let Banner = mongoose.model("Banner", banner_schema);
module.exports = Banner;
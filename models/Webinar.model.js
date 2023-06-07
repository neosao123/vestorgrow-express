const mongoose = require("mongoose");

const webinarSchema = mongoose.Schema(
    {
        title: {
            type: String,
        },
        start_date: {
            type: Date
        },
        end_date: {
            type: Date
        },
        desc: {
            type: String,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WebinarCategory",
        },
        webinar_link: {
            type: String,
        },
        banner_image: {
            type: String,
        },
        video: {
            type: String,
        },
        is_active: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let Webinar = mongoose.model("Webinar", webinarSchema);
module.exports = Webinar;

const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema(
    {
        course_name: {
            type: String,
        },
        course_desc: {
            type: String,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cover_image: {
            type: String,
        },
        banner_image: {
            type: String,
        },
        level: {
            type: String,
        },
        is_publish: {
            type: Boolean,
            default: false,
        },
        users_enrolled: {
            type: Number,
            default: 0,
        },
        watch_time: {
            type: Number,
            default: 0,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        topics: [
            {
                topic_title: {
                    type: String,
                },
                sub_topics: [
                    {
                        sub_topic_title: {
                            type: String,
                        },
                        lessons: [
                            {
                                lesson_title: {
                                    type: String,
                                },
                                desc: {
                                    type: String,
                                },
                                lesson_video: {
                                    type: String,
                                },
                                lesson_cover: {
                                    type: String,
                                },
                                watch_time: {
                                    type: Number,
                                    default: 0
                                },
                            },
                        ],
                    }
                ]
            }
        ],

        is_active: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let Lesson = mongoose.model("lesson", lessonSchema);
module.exports = Lesson;

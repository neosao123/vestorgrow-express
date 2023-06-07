const mongoose = require("mongoose");

const learningMaterialSchema = mongoose.Schema(
    {
        title: {
            type: String,
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
            ref: "LearningMaterialCategory",
        },
        cover_image: {
            type: String,
        },
        banner_image: {
            type: String,
        },
        is_active: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let LearningMaterial = mongoose.model("LearningMaterial", learningMaterialSchema);
module.exports = LearningMaterial;

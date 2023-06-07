const mongoose = require("mongoose");

const LearningMaterialCategorySchema = mongoose.Schema({
    name: {
        type: String,
    },
    is_active: {
        type: Number,
        default: 1
    }
});
let LearningMaterialCategory = mongoose.model("LearningMaterialCategory", LearningMaterialCategorySchema);
module.exports = LearningMaterialCategory;
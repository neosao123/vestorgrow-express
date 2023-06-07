const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema({
    name: {
        type: String,
    },
    is_active: {
        type: Number,
        default: 1
    }
});
let Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
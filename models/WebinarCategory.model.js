const mongoose = require("mongoose");

const WebinarCategorySchema = mongoose.Schema({
    name: {
        type: String,
    },
    is_active: {
        type: Number,
        default: 1
    }
});
let WebinarCategory = mongoose.model("WebinarCategory", WebinarCategorySchema);
module.exports = WebinarCategory;
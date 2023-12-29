const mongoose = require("mongoose");

const avatarSchema = mongoose.Schema({
    images: {
        type: String,
        default: "",
    },
    title: {
        type: String,
        default: ""
    }
})

const Avatars = mongoose.model("avatars", avatarSchema);
module.exports = Avatars;
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

const AvatarImages = mongoose.model("avatar_images", avatarSchema);
module.exports = AvatarImages;
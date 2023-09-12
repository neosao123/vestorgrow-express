const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const appleUserSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
    },
    user_name: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  { timestamps: true, strict: false }
);

let AppleUser = mongoose.model("AppleUsers", appleUserSchema);
module.exports = AppleUser;

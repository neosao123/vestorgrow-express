const mongoose = require("mongoose");

const notification_schema = mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    title: {
      type: String,
    },
    type: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    is_viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "createdAt" } }
);
let Notification = mongoose.model("Notification", notification_schema);
module.exports = Notification;

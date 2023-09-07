const mongoose = require("mongoose");

const chat_schema = mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    chatLogo: {
      type: String,
    },
    chatDesc: {
      type: String,
    },
    chatRules: {
      type: String,
    },
    chatKeyword: [
      {
        type: String,
      },
    ],
    isPrivate: {
      type: Boolean,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    colour: [String],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deleted_for: [String],
  },
  { timestamps: { createdAt: "createdAt" } }
);
let Chat = mongoose.model("Chat", chat_schema);
module.exports = Chat;

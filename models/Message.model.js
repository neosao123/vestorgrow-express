const mongoose = require("mongoose");

const message_schema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
            trim: true
        },
        file: [String],
        content_type: {
            type: String
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        },
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        deleted_for: [String],
    },
    { timestamps: { createdAt: "createdAt" } }
);
let Message = mongoose.model("Message", message_schema);
module.exports = Message;
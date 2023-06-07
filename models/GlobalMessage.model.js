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
        file: {
            type: String
        },
        content_type: {
            type: String
        },
        // chat: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Chat"
        // },
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        deleted_for: [String],
    },
    { timestamps: { createdAt: "createdAt" } }
);
let GlobalMessage = mongoose.model("GlobalMessage", message_schema);
module.exports = GlobalMessage;
const mongoose = require("mongoose");

const postkeyword_scema = mongoose.Schema(
    {
        keyword: {
            type: String,
            default: ""
        },
        keywordSmallCase: {
            type: String,
            default: ""
        },
        count: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            default: "financial"
        }
    },
    { timestamps: { createdAt: "createdAt" } }
);
let Postkwyword = mongoose.model("Postkeyword", postkeyword_scema);
module.exports = Postkwyword;
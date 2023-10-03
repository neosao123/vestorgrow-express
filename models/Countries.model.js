const mongoose = require("mongoose");

const CountriesSchema = mongoose.Schema(
    {
        countryName: {
            type: String
        },
        countryCode: {
            type: String
        },
        hasForum: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);
let Country = mongoose.model("countries", CountriesSchema);
module.exports = Country;
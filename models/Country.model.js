const mongoose = require("mongoose");

const countrySchema = mongoose.Schema(
  {
    name: { type: String },
    iso3: { type: String, default: null },
    numeric_code: { type: String, default: null },
    iso2: { type: String, default: null },
    phonecode: { type: String, default: null },
    capital: { type: String, default: null },
    currency: { type: String, default: null },
    currency_name: { type: String, default: null },
    currency_symbol: { type: String, default: null },
    tld: { type: String, default: null },
    region: { type: String, default: null },
    subregion: { type: String, default: null },
    // native: { type: String, default: null },
    // timezones: { type: String, default: null },
    // translations: { type: String, default: null },
    // latitude: { type: Number, default: null },
    // longitude: { type: Number, default: null },
    // emoji: { type: String, default: null },
    // emojiU: { type: String, default: null },
    // flagImage: { type: String, default: null },
    // wikiDataId: { type: String, default: null },
  },
  { timestamps: true, strict: false }
);

let Country = mongoose.model("countries", countrySchema);
module.exports = Country;

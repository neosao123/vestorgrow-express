const Country = require("../models/Country.model");

module.exports = {
  get: async () => {
    let result = {};
    try {
      const getCountries = await Country.find(
        {},
        { name: 1, iso2: 1, phonecode: 1 }
      );
      const finalData = getCountries.map((val) => ({
        country_id: val._id,
        name: val.name,
        code: val.iso2,
        dial_code: val.phonecode,
      }));
      if (getCountries) {
        result.message = "Success";
        result.country = finalData;
      } else {
        throw Error("Failed!");
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },
};

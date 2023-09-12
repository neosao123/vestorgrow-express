const countryService = require("../services/country.service");

module.exports = {
  get: async (req, res) => {
    const result = await countryService.get();
    if (result.status == 400) {
      res.status(400).send({ message: result.message });
    } else {
      res.send(result);
    }
  },
};

const AppleUserService = require("../services/appleUser.service");
module.exports = {
  add: async function (req, res) {
    const result = await AppleUserService.add(req.body);
    if (result.status == 400) {
      res.status(400).send({ message: result.message });
    } else {
      res.send(result);
    }
  },
  getById: async function (req, res) {
    const result = await AppleUserService.getById(req.query.user_id);
    if (result.status !== 200) {
      res.status(result.status).send({ message: result.message });
    } else {
      delete result.status;
      res.send(result);
    }
  },
};

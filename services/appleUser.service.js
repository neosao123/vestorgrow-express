const AppleUser = require("../models/AppleUser.model");
const { ObjectId } = require("mongodb");
module.exports = {
  add: async function (user) {
    let result = {};
    try {
      if (!user.email || !user.user_name || !user.user_id) {
        throw Error("All fields required!");
      }
      const userExist = await AppleUser.findOne({ user_id: user.user_id });
      if (userExist) {
        throw Error("User Id Already Exist");
      }
      const addUser = await AppleUser.create(user);
      if (addUser) {
        result.message = "Success";
      } else {
        result.message = "Failed";
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },
  getById: async function (user_id) {
    let result = {};
    try {
      if (!user_id) {
        throw Error("User id is required!");
      }
      const getUser = await AppleUser.findOne({ user_id });
      if (getUser) {
        result.data = getUser;
        result.message = "Success";
        result.status = 200;
      } else {
        throw Error("Not found!");
      }
    } catch (error) {
      if ((error.message = "Not found!")) {
        result.status = 202;
      } else {
        result.status = 400;
      }
      result.message = error.message;
    }
    return result;
  },
};

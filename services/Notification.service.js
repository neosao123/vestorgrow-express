const Notification = require("../models/Notification.model");

module.exports = {
  save: async function (notification) {
    let result = {};
    try {
      result.data = await new Notification(notification).save();
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  edit: async function (body) {
    let result = {};
    try {
      if (body && body._id) {
        result.data = await Notification.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  delete: async function (id) {
    let result = {};
    try {
      result.data = await Notification.findByIdAndDelete(id);
      return { message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (notificationObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};

    const { start, length } = notificationObj;
    if (notificationObj.filter !== undefined) {
      if (notificationObj.filter.searchText !== undefined) {
        condition["title"] = {
          $regex: ".*" + notificationObj.filter.searchText + ".*",
          $options: "i",
        };
      }
      if (
        notificationObj.filter.is_viewed !== undefined &&
        notificationObj.filter.is_viewed !== null &&
        notificationObj.filter.is_viewed != ""
      ) {
        condition["is_viewed"] = notificationObj.filter.is_viewed;
      }
    }
    condition["createdFor"] = currUser._id;
    try {
      if (start === undefined || length === undefined) {
        data = await Notification.find(condition).populate("createdBy").populate("groupId").sort({
          createdAt: "desc",
        });
      } else {
        data = await Notification.find(condition)
          .populate("createdBy")
          .populate("groupId")
          .limit(parseInt(length))
          .skip(start)
          .sort({
            createdAt: "desc",
          });
      }

      count = await Notification.countDocuments(condition);
      result = {
        data: data,
        total: count,
        currPage: parseInt(start / length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  getDetail: async function (id) {
    let result = {};
    try {
      if (id) {
        result.data = await Notification.findById(id);
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

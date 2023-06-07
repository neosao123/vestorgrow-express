const GlobalMessage = require("../models/GlobalMessage.model");
const Chat = require("../models/Chat.model");

module.exports = {
  add: async function (message, currUser) {
    message.readBy = [currUser._id];
    let result = {};
    try {
      result.data = await new GlobalMessage(message).save();
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  edit: async function (body) {
    let result = {};
    try {
      if (body && body._id) {
        result.data = await GlobalMessage.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        return { message: "Updated Successfully", result };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  markAsRead: async function (body, currUser) {
    let result = {};
    try {
      result.data = await GlobalMessage.updateMany(
        { readBy: { $nin: currUser._id } },
        { $push: { readBy: currUser._id } }
      );
      return { message: "Updated Successfully", result };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  delete: async function (id) {
    let result = {};
    let toBeDeleted = [];
    try {
      result.data = await GlobalMessage.findByIdAndDelete(id);
      toBeDeleted.push(result.data.file);
      result.toBeDeleted = toBeDeleted;
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  deleteGlobalMessage: async function (message, currUser) {
    let result = {};
    try {
      result.data = await GlobalMessage.findByIdAndUpdate(message._id, {
        $push: { deleted_for: message.deleted_for },
      });
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (messageObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let sortBy = { createdAt: "asc" };
    if (messageObj.filter !== undefined) {
      if (messageObj.filter.searchText !== undefined) {
        condition = {
          $or: [
            {
              title: {
                $regex: ".*" + messageObj.filter.searchText + ".*",
                $options: "i",
              },
            },
          ],
        };
      }
      // if (
      //     messageObj.filter.is_active !== undefined &&
      //     messageObj.filter.is_active !== null &&
      //     messageObj.filter.is_active != ""
      // ) {
      //     condition["is_active"] = messageObj.filter.is_active;
      // }
    }
    if (messageObj.sortBy !== undefined) {
      sortBy = messageObj.sortBy;
    }

    try {
      // await GlobalMessage.updateMany(
      //   { chat: messageObj.filter.chat, readBy: { $nin: currUser._id } },
      //   { $push: { readBy: currUser._id } }
      // );
      if (messageObj.start === undefined || messageObj.length === undefined) {
        data = await GlobalMessage.find(condition)
          .populate("sender", "first_name last_name profile_img user_name")
          .sort(sortBy);
      } else {
        data = await GlobalMessage.find(condition)
          .populate("sender", "first_name last_name profile_img user_name")
          .limit(parseInt(messageObj.length))
          .skip(messageObj.start)
          .sort(sortBy);
      }
      let unreadCount = 0;
      for (item of data) {
        if (!item.readBy.includes(currUser._id + "")) {
          unreadCount += 1;
        }
      }
      count = await GlobalMessage.countDocuments(condition);
      result = {
        data: data,
        total: count,
        unreadCount: unreadCount,
        currPage: parseInt(messageObj.start / messageObj.length) + 1,
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
        result.data = await GlobalMessage.findById(id);
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

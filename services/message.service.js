const Message = require("../models/Message.model");
const Chat = require("../models/Chat.model");
const Notifcation = require("../models/Notification.model");

module.exports = {
  add: async function (message, currUser) {
    message.readBy = [currUser._id];
    let result = {};
    try {
      result.data = await new Message(message).save();
      let chat = await Chat.findByIdAndUpdate(
        message.chat,
        { $set: { latestMessage: result.data._id } },
        { new: true }
      );
      let notificationObjArr = [];
      let notificationObj = {
        groupId: message.chat,
        title: "sent you a message",
        type: "message",
        createdBy: currUser._id,
      };
      if (chat?.chatName && chat.chatName !== "") {
        notificationObj.title = `sent a message on`;
      }
      chat.users.map((i) => {
        if (currUser._id + "" !== i + "") {
          notificationObjArr.push({ ...notificationObj, createdFor: i });
        }
      });
      console.log(notificationObjArr);
      await Notifcation.insertMany(notificationObjArr);
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  edit: async function (body) {
    let result = {};
    try {
      if (body && body._id) {
        result.data = await Message.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        return { message: "Updated Successfully", result };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  delete: async function (id) {
    let result = {};
    let toBeDeleted = [];
    try {
      result.data = await Message.findByIdAndDelete(id);
      toBeDeleted.push(result.data.file);
      result.toBeDeleted = toBeDeleted;
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  deleteMessage: async function (message, currUser) {
    let result = {};
    try {
      result.data = await Message.findByIdAndUpdate(message._id, {
        $push: { deleted_for: message.deleted_for },
      });
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  composeMessage: async function (message, currUser) {
    let result = {};
    let chat = "";
    try {
      for (let item of message.users) {
        let chatUser = [item._id, currUser._id];
        let resp = await Chat.findOne({ users: { $all: chatUser }, isGroupChat: false });
        if (!resp) {
          let data = await new Chat({ users: chatUser }).save();
          chat = data._id;
        } else {
          chat = resp._id;
        }
        message.chat = chat;
        message.sender = currUser._id;
        result.data = await new Message(message).save();
        await Chat.findByIdAndUpdate(message.chat, { $set: { latestMessage: result.data._id } }, { new: true });
      }
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
      if (messageObj.filter.chat !== undefined && messageObj.filter.chat !== null && messageObj.filter.chat != "") {
        condition["chat"] = messageObj.filter.chat;
      }
    }
    if (messageObj.sortBy !== undefined) {
      sortBy = messageObj.sortBy;
    }

    try {
      await Message.updateMany(
        { chat: messageObj.filter.chat, readBy: { $nin: currUser._id } },
        { $push: { readBy: currUser._id } }
      );
      if (messageObj.start === undefined || messageObj.length === undefined) {
        data = await Message.find(condition)
          .populate("sender", "first_name last_name profile_img user_name")
          .sort(sortBy);
      } else {
        data = await Message.find(condition)
          .populate("sender", "first_name last_name profile_img user_name")
          .limit(parseInt(messageObj.length))
          .skip(messageObj.start)
          .sort(sortBy);
      }

      count = await Message.countDocuments(condition);
      result = {
        data: data,
        total: count,
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
        result.data = await Message.findById(id);
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

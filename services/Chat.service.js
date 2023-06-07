const Chat = require("../models/Chat.model");
const Message = require("../models/Message.model");
const UserBlocked = require("../models/UserBlocked.model");
const GroupInvitation = require("../models/GroupInvitation.model");
const Notifcation = require("../models/Notification.model");

module.exports = {
  save: async function (chat, currUser) {
    let result = {};
    try {
      let resp = await Chat.findOne({ users: { $all: chat.users }, isGroupChat: false });
      if (!resp || chat.isGroupChat) {
        result.data = await new Chat(chat).save();
        if (chat.isGroupChat) {
          let notificationObj = {
            groupId: result.data._id,
            title: "invited you to",
            type: "groupInvite",
            createdBy: currUser._id,
          };
          let insertArr = [];
          if (chat.invitedUser) {
            chat.invitedUser.split(",").forEach((i) => {
              insertArr.push({ userId: i, groupId: result.data._id });
              notificationObj.createdFor = i;
            });
            await GroupInvitation.insertMany(insertArr);
            await new Notifcation(notificationObj).save();
          }
        }
      } else {
        result.data = resp;
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  edit: async function (body) {
    let result = {};
    try {
      if (body && body._id) {
        result.data = await Chat.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        return { message: "Updated Successfully" };
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
      result.data = await Chat.findByIdAndDelete(id);

      await GroupInvitation.deleteMany({ groupId: id });
      let message = await Message.find({ chat: id });
      await Message.deleteMany({ chat: id });
      toBeDeleted.push(message.file);
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  deleteChat: async function (chat, currUser) {
    let result = {};
    try {
      result.data = await Chat.findByIdAndUpdate(chat._id, {
        $push: { deleted_for: chat.deleted_for },
      });
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  listAll: async function (chatObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let userPath = {
      path: "users",
      match: {},
      select: { first_name: 1, last_name: 1, profile_img: 1, role: 1, title: 1, user_name: 1 },
    };
    const { start, length } = chatObj;
    condition["users"] = { $in: [currUser._id] };
    if (chatObj.filter !== undefined) {
      if (chatObj.filter.searchText !== undefined) {
        condition["chatName"] = {
          $regex: ".*" + chatObj.filter.searchText + ".*",
          $options: "i",
        };
      }
      if (chatObj.filter.userName !== undefined) {
        userPath.match["user_name"] = {
          $regex: ".*" + chatObj.filter.userName + ".*",
          $options: "i",
        };
        // 'first_name': {$eq: phoneNumber},'last_name': {$eq: phoneNumber},
      }
      if (
        chatObj.filter.isGroupChat !== undefined &&
        chatObj.filter.isGroupChat !== null &&
        chatObj.filter.isGroupChat !== ""
      ) {
        condition["isGroupChat"] = chatObj.filter.isGroupChat;
      }
      if (chatObj.filter.user !== undefined && chatObj.filter.user !== null && chatObj.filter.user !== "") {
        condition["users"] = { $in: [chatObj.filter.user] };
      }
    }

    try {
      let blockedUser = await (
        await UserBlocked.find({ userId: currUser._id }, { blockedId: 1 })
      ).map((resp) => resp.blockedId + "");
      condition["users"]["$nin"] = blockedUser;
      if (start === undefined || length === undefined) {
        data = await Chat.find(condition)
          .populate(userPath)
          .populate("latestMessage")
          .sort({
            updatedAt: "desc",
          })
          .then((orders) => orders.filter((order) => order.users.length != 0));
      } else {
        data = await Chat.find(condition)
          .populate(userPath)
          .populate("latestMessage")
          .limit(parseInt(length))
          .skip(start)
          .sort({
            updatedAt: "desc",
          })
          .then((orders) => orders.filter((order) => order.users.length != 0));
      }
      // .populate()
      for (let chat of data) {
        chat._doc.unreadCount = await Message.count({ chat: chat._id, readBy: { $nin: [currUser._id] } });
      }
      count = await Chat.countDocuments(condition);
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
  searchGroup: async function (chatObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let userPath = {
      path: "users",
      match: {},
      select: { first_name: 1, last_name: 1, profile_img: 1, role: 1, title: 1, user_name: 1 },
    };
    const { start, length } = chatObj;
    if (chatObj.filter !== undefined) {
      if (chatObj.filter.searchText !== undefined) {
        condition["$or"] = [
          {
            chatName: {
              $regex: ".*" + chatObj.filter.searchText + ".*",
              $options: "i",
            },
          },
          {
            chatKeyword: {
              $regex: ".*" + chatObj.filter.searchText + ".*",
              $options: "i",
            },
          },
        ];
      }
      if (chatObj.filter.userName !== undefined) {
        userPath.match["user_name"] = {
          $regex: ".*" + chatObj.filter.userName + ".*",
          $options: "i",
        };
        // 'first_name': {$eq: phoneNumber},'last_name': {$eq: phoneNumber},
      }
      if (
        chatObj.filter.isGroupChat !== undefined &&
        chatObj.filter.isGroupChat !== null &&
        chatObj.filter.isGroupChat !== ""
      ) {
        condition["isGroupChat"] = chatObj.filter.isGroupChat;
      }
    }
    // condition["users"] = { $in: [currUser._id] };
    try {
      // let blockedUser = await (
      //   await UserBlocked.find({ userId: currUser._id }, { blockedId: 1 })
      // ).map((resp) => resp.blockedId + "");
      // condition["users"]["$nin"] = blockedUser;
      if (start === undefined || length === undefined) {
        data = await Chat.find(condition)
          .populate(userPath)
          .populate("latestMessage")
          .sort({
            updatedAt: "desc",
          })
          .then((orders) => orders.filter((order) => order.users.length != 0));
      } else {
        data = await Chat.find(condition)
          .populate(userPath)
          .populate("latestMessage")
          .limit(parseInt(length))
          .skip(start)
          .sort({
            updatedAt: "desc",
          })
          .then((orders) => orders.filter((order) => order.users.length != 0));
      }
      // .populate()
      let reqData = await GroupInvitation.find({ userId: currUser._id, from_user: true }).then((resp) =>
        resp.map((i) => i.groupId + "")
      );
      for (let chat of data) {
        if (reqData.includes(chat._id + "")) {
          chat._doc.requested = true;
        } else {
          chat._doc.requested = false;
        }
        chat._doc.unreadCount = await Message.count({ chat: chat._id, readBy: { $nin: [currUser._id] } });
      }
      count = await Chat.countDocuments(condition);
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
  joinGroup: async function (body, currUser) {
    let result = {};
    let userId = currUser._id;
    if (body.user_id) {
      userId = body.user_id;
    }
    try {
      if (body && body.groupId) {
        result.data = await Chat.findOneAndUpdate(
          { _id: body.groupId, users: { $nin: userId } },
          { $push: { users: userId } },
          { new: true }
        );
        if (result.data) {
          await GroupInvitation.findOneAndDelete({ userId: userId, groupId: body.groupId });
        }
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  deleteInvitation: async function (body, currUser) {
    let result = {};
    try {
      if (body && body.groupId) {
        await GroupInvitation.findOneAndDelete({ userId: currUser._id, groupId: body.groupId });
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  makeAdmin: async function (body, currUser) {
    let result = {};
    try {
      if (body && body.groupId) {
        result.data = await Chat.findOneAndUpdate(
          { _id: body.groupId, groupAdmin: { $nin: body.userId } },
          { $push: { groupAdmin: body.userId } },
          { new: true }
        );
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  acceptInvitationLink: async function (body, currUser) {
    let result = {};
    try {
      if (body && body.groupId) {
        result.data = await Chat.findOneAndUpdate(
          { _id: body.groupId, users: { $nin: currUser._id } },
          { $push: { users: currUser._id } },
          { new: true }
        );
        // if (result.data) {
        //   await GroupInvitation.findOneAndDelete({ userId: currUser._id, groupId: body.groupId });
        // }
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  leaveGroup: async function (body, currUser) {
    let result = {};
    try {
      if (body && body.groupId) {
        let data = await Chat.findById(body.groupId).exec();
        if (data) {
          data.users = data.users.filter((i) => i + "" !== currUser._id + "");
          await data.save();
        }
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  removeFromGroup: async function (body, currUser) {
    let result = {};
    try {
      if (body && body.groupId) {
        let data = await Chat.findById(body.groupId).exec();
        if (data) {
          data.users = data.users.filter((i) => i + "" !== body.userId + "");
          await data.save();
        }
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  listInvitation: async function (chatObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let userPath = {
      path: "userId",
      match: {},
      select: { first_name: 1, last_name: 1, profile_img: 1, role: 1, title: 1, user_name: 1 },
    };
    let groupPath = {
      path: "groupId",
      match: {},
      select: { chatName: 1, chatLogo: 1, chatDesc: 1, users: 1 },
    };
    const { start, length } = chatObj;
    if (chatObj.filter !== undefined) {
      if (chatObj.filter.searchText !== undefined) {
        condition["chatName"] = {
          $regex: ".*" + chatObj.filter.searchText + ".*",
          $options: "i",
        };
      }
      if (chatObj.filter.userName !== undefined) {
        userPath.match["user_name"] = {
          $regex: ".*" + chatObj.filter.userName + ".*",
          $options: "i",
        };
        // 'first_name': {$eq: phoneNumber},'last_name': {$eq: phoneNumber},
      }
    }
    condition["userId"] = currUser._id;
    condition["from_user"] = false;
    try {
      if (start === undefined || length === undefined) {
        data = await GroupInvitation.find(condition).populate(userPath).populate(groupPath).sort({
          updatedAt: "desc",
        });
      } else {
        data = await GroupInvitation.find(condition)
          .populate(userPath)
          .populate(groupPath)
          .limit(parseInt(length))
          .skip(start)
          .sort({
            updatedAt: "desc",
          });
      }
      // .populate()
      count = await GroupInvitation.countDocuments(condition);
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
        result.data = await Chat.findById(id).populate("createdBy");
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  getDetailMemberList: async function (id) {
    let result = {};
    try {
      if (id) {
        result.data = await Chat.findById(id).populate("createdBy").populate("users");
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  sendInvitation: async function (data, currUser) {
    let result = {};
    try {
      let insertArr = [];
      let notificationObj = {
        groupId: data.groupId,
        title: "invited you to",
        type: "groupInvite",
        createdBy: currUser._id,
      };
      let oldUser = [];
      let groupInfo = await Chat.findById(data.groupId).then((resp) => {
        return resp.users.map((i) => i + "");
      });

      let invitationInfo = await GroupInvitation.find({ groupId: data.groupId }).then((resp) => {
        return resp.map((i) => {
          return i.userId + "";
        });
      });
      oldUser = [...groupInfo, ...invitationInfo];
      data.invitedUser.forEach(async (i) => {
        // await Chat.find({_id:data.groupId,users:{$in:i}})
        if (!oldUser.includes(i)) {
          insertArr.push({ userId: i, groupId: data.groupId });
          notificationObj.createdFor = i;
        }
      });
      await GroupInvitation.insertMany(insertArr);
      await new Notifcation(notificationObj).save();
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  userInvitation: async function (data, currUser) {
    let result = {};
    try {
      let insertArr = [];
      let notificationObj = {
        groupId: data.groupId,
        title: "want to join",
        type: "groupInvite",
        createdBy: currUser._id,
      };
      let oldUser = [];
      let groupDetails = await Chat.findById(data.groupId);
      let groupInfo = groupDetails.users.map((i) => i + "");

      let invitationInfo = await GroupInvitation.find({ groupId: data.groupId }).then((resp) => {
        return resp.map((i) => {
          return i.userId + "";
        });
      });
      oldUser = [...groupInfo, ...invitationInfo];
      // data.invitedUser.forEach(async (i) => {
      //   // await Chat.find({_id:data.groupId,users:{$in:i}})
      if (!oldUser.includes(currUser._id)) {
        insertArr.push({ userId: currUser._id, groupId: data.groupId, from_user: true });
        notificationObj.createdFor = groupDetails.createdBy;
      }
      // });
      await GroupInvitation.insertMany(insertArr);
      await new Notifcation(notificationObj).save();
      return { message: "Updated Successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  suggestGroup: async function (chatObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let userPath = {
      path: "users",
      match: {},
      select: { first_name: 1, last_name: 1, profile_img: 1, role: 1, title: 1, user_name: 1 },
    };
    const { start, length } = chatObj;
    if (chatObj.filter !== undefined) {
      if (chatObj.filter.searchText !== undefined) {
        condition["$or"] = [
          {
            chatName: {
              $regex: ".*" + chatObj.filter.searchText + ".*",
              $options: "i",
            },
          },
          {
            chatKeyword: {
              $regex: ".*" + chatObj.filter.searchText + ".*",
              $options: "i",
            },
          },
        ];
      }
      condition["isGroupChat"] = chatObj.filter.isGroupChat;
    }

    try {
      data = await Chat.find(condition)
        .sort({
          users: 1
        })
        .then((orders) => orders.filter((order) => order.users.length != 0));
      count = await Chat.countDocuments(condition);
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
};

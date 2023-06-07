const UserFollower = require("../models/UserFollower.model");
const UserFollowerTemp = require("../models/UserFollowerTemp.model");
const User = require("../models/User.model");

module.exports = {
  save: async function (data, currUser) {
    let result = {};
    try {
      let requested = await UserFollowerTemp.findOne({ userId: data.followingId, followingId: currUser._id });
      if (!requested) {
        throw Error("Request not found");
      }
      let following = await UserFollower.findOne({ userId: data.followingId, followingId: currUser._id });
      if (following) {
        throw Error("Already following this user");
      }
      data = { userId: data.followingId, followingId: currUser._id };
      result.data = await new UserFollower(data).save();
      await UserFollowerTemp.deleteOne({ userId: data.userId, followingId: data.followingId });
      await User.findByIdAndUpdate(data.userId, { $inc: { following: 1 } });
      await User.findByIdAndUpdate(data.followingId, { $inc: { followers: 1 } });
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  unfollow: async function (id, currUser) {
    let result = {};
    try {
      let following = await UserFollower.findOne({ userId: currUser._id, followingId: id });

      if (!following) {
        throw Error("Already not following this user");
      }
      result.data = await UserFollower.deleteOne({ userId: currUser._id, followingId: id });
      await User.findByIdAndUpdate(currUser._id, { $inc: { following: -1 } });
      await User.findByIdAndUpdate(id, { $inc: { followers: -1 } });
      return { message: "Unfollowed user successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (followObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let followingId = { path: "followingId" };
    let userId = { path: "userId" };
    const { start, length } = followObj;
    if (followObj.filter !== undefined) {
      if (
        followObj.filter.listType !== undefined &&
        followObj.filter.listType !== null &&
        followObj.filter.listType != ""
      ) {
        if (followObj.filter.listType == "follower") {
          condition["followingId"] = currUser._id;
          if (
            followObj.filter.searchText !== undefined &&
            followObj.filter.searchText !== null &&
            followObj.filter.searchText !== ""
          ) {
            userId.match = {
              $or: [
                {
                  user_name: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
                {
                  email: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
              ],
            };
          }
        } else if (followObj.filter.listType == "following") {
          condition["userId"] = currUser._id;
          if (
            followObj.filter.searchText !== undefined &&
            followObj.filter.searchText !== null &&
            followObj.filter.searchText !== ""
          ) {
            followingId.match = {
              $or: [
                {
                  user_name: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
                {
                  email: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
              ],
            };
          }
        }
      }
    }
    try {
      if (start === undefined || length === undefined) {
        data = await UserFollower.find(condition)
          .populate(followingId)
          .populate(userId)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.userId != null && item.followingId != null));
        if (data && followObj.filter.listType == "follower") {
          await User.findByIdAndUpdate(currUser._id, { followers: data.length });
        } else if (data && followObj.filter.listType == "following") {
          await User.findByIdAndUpdate(currUser._id, { following: data.length });
        }
      } else {
        data = await UserFollower.find(condition)
          .populate(followingId)
          .populate(userId)
          .limit(parseInt(length))
          .skip(start)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.userId != null && item.followingId != null));
      }
      if (followObj.filter.listType == "follower") {
        for (let item of data) {
          let is_following = await this.isFollowing({ followingId: item.userId._id }, currUser);
          item._doc.is_following = is_following.data;
        }
      }
      // condition = { followingId: currUser._id, userId: { $ne: null } };
      // console.log("condition", condition);
      // count = await UserFollower.countDocuments(condition);
      result = {
        data: data,
        total: data.length,
        currPage: parseInt(start / length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAllOther: async function (followObj, oUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let followingId = { path: "followingId" };
    let userId = { path: "userId" };
    const { start, length } = followObj;
    if (followObj.filter !== undefined) {
      if (
        followObj.filter.listType !== undefined &&
        followObj.filter.listType !== null &&
        followObj.filter.listType != ""
      ) {
        if (followObj.filter.listType == "follower") {
          condition["followingId"] = oUser;
          if (
            followObj.filter.searchText !== undefined &&
            followObj.filter.searchText !== null &&
            followObj.filter.searchText !== ""
          ) {
            userId.match = {
              $or: [
                {
                  user_name: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
                {
                  email: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
              ],
            };
          }
        } else if (followObj.filter.listType == "following") {
          condition["userId"] = oUser;
          if (
            followObj.filter.searchText !== undefined &&
            followObj.filter.searchText !== null &&
            followObj.filter.searchText !== ""
          ) {
            followingId.match = {
              $or: [
                {
                  user_name: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
                {
                  email: {
                    $regex: ".*" + followObj.filter.searchText + ".*",
                    $options: "i",
                  },
                },
              ],
            };
          }
        }
      }
    }
    try {
      if (start === undefined || length === undefined) {
        data = await UserFollower.find(condition)
          .populate(followingId)
          .populate(userId)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.userId != null && item.followingId != null));
      } else {
        data = await UserFollower.find(condition)
          .populate(followingId)
          .populate(userId)
          .limit(parseInt(length))
          .skip(start)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.userId != null && item.followingId != null));
      }
      // if (followObj.filter.listType == "follower") {
      //   for (let item of data) {
      //     let is_following = await this.isFollowing({ followingId: item.userId._id }, currUser);
      //     item._doc.is_following = is_following.data;
      //   }
      // }
      // condition = { followingId: currUser._id, userId: { $ne: null } };
      // console.log("condition", condition);
      // count = await UserFollower.countDocuments(condition);
      result = {
        data: data,
        total: data.length,
        currPage: parseInt(start / length) + 1,
      };
      // console.log("1212", data);
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  getDetail: async function (id) {
    let result = {};
    try {
      if (id) {
        result.data = await UserFollower.findById(id);
      } else {
        throw Error("Record not found");
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  isFollowing: async function (body, currUser) {
    let result = {};
    try {
      let data = await UserFollower.findOne({ userId: currUser._id, followingId: body.followingId });
      let tempData = await UserFollowerTemp.findOne({ userId: currUser._id, followingId: body.followingId });
      if (data) {
        result.data = "following";
      } else if (tempData) {
        result.data = "requested";
      } else {
        result.data = false;
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  sendReq: async function (data, currUser) {
    let result = {};
    try {
      if (currUser._id == data.followingId) {
        throw Error("You can't follow your self");
      }

      let requested = await UserFollowerTemp.findOne({ userId: currUser._id, followingId: data.followingId });
      if (requested) {
        result.err = "Already requested";
      }

      let following = await UserFollower.findOne({ userId: currUser._id, followingId: data.followingId });
      if (following) {
        result.err = "Already following this user";
      }

      let userDetail = await User.findById(data.followingId);
      if (!userDetail?.setting || !userDetail.setting.private) {
        data = { userId: currUser._id, followingId: data.followingId, requested: false };
        await new UserFollowerTemp(data).save().then(async (re) => {
          result.data = await new UserFollower(data).save();
          await User.findByIdAndUpdate(data.userId, { $inc: { following: 1 } });
          await User.findByIdAndUpdate(data.followingId, { $inc: { followers: 1 } });
        });
      } else {
        data = { userId: currUser._id, followingId: data.followingId, requested: true };
        result.data = await new UserFollowerTemp(data).save();
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  rejectReq: async function (id, currUser) {
    let result = {};
    try {
      let following = await UserFollowerTemp.findOne({ userId: id, followingId: currUser._id });

      if (!following) {
        throw Error("Already not following this user");
      }
      result.data = await UserFollowerTemp.deleteOne({ userId: id, followingId: currUser._id });
      // await User.findByIdAndUpdate(currUser._id, { $inc: { following: -1 } })
      // await User.findByIdAndUpdate(id, { $inc: { followers: -1 } })
      return { message: "Unfollowed user successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  listAllSentReq: async function (followObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let followingId = { path: "followingId" };
    let userId = { path: "userId" };
    const { start, length } = followObj;
    condition["userId"] = currUser._id;
    try {
      if (start === undefined || length === undefined) {
        data = await UserFollowerTemp.find(condition).populate(userId).sort({
          _id: "desc",
        });
      } else {
        data = await UserFollowerTemp.find(condition).populate(userId).limit(parseInt(length)).skip(start).sort({
          _id: "desc",
        });
      }
      count = await UserFollowerTemp.countDocuments(condition);
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
  listAllReq: async function (followObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let followingId = { path: "followingId" };
    let userId = { path: "userId" };
    const { start, length } = followObj;
    // if (followObj.filter !== undefined) {
    //     if (
    //         followObj.filter.listType !== undefined &&
    //         followObj.filter.listType !== null &&
    //         followObj.filter.listType != ""
    //     ) {
    //         if (followObj.filter.listType == "follower") {
    //             condition["followingId"] = currUser._id;
    //             if (followObj.filter.searchText !== undefined && followObj.filter.searchText !== null && followObj.filter.searchText !== "") {
    //                 userId.match = {
    //                     $or: [
    //                         {
    //                             user_name: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                         {
    //                             email: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                     ],
    //                 }
    //             }
    //         } else if (followObj.filter.listType == "following") {
    //             condition["userId"] = currUser._id
    //             if (followObj.filter.searchText !== undefined && followObj.filter.searchText !== null && followObj.filter.searchText !== "") {
    //                 followingId.match = {
    //                     $or: [
    //                         {
    //                             user_name: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                         {
    //                             email: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                     ]
    //                 }
    //             }
    //         }
    //     }
    // }
    condition["followingId"] = currUser._id;
    try {
      if (start === undefined || length === undefined) {
        data = await UserFollowerTemp.find(condition).populate(userId).sort({
          _id: "desc",
        });
      } else {
        data = await UserFollowerTemp.find(condition).populate(userId).limit(parseInt(length)).skip(start).sort({
          _id: "desc",
        });
      }
      count = await UserFollowerTemp.countDocuments(condition);
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
  listAllFriends: async function (followObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let friendsList = [];
    let followingId = { path: "followingId" };
    let userId = { path: "userId" };
    const { start, length } = followObj;
    // if (followObj.filter !== undefined) {
    //     if (
    //         followObj.filter.listType !== undefined &&
    //         followObj.filter.listType !== null &&
    //         followObj.filter.listType != ""
    //     ) {
    //         if (followObj.filter.listType == "follower") {
    //             condition["followingId"] = currUser._id;
    //             if (followObj.filter.searchText !== undefined && followObj.filter.searchText !== null && followObj.filter.searchText !== "") {
    //                 userId.match = {
    //                     $or: [
    //                         {
    //                             user_name: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                         {
    //                             email: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                     ],
    //                 }
    //             }
    //         } else if (followObj.filter.listType == "following") {
    //             condition["userId"] = currUser._id
    //             if (followObj.filter.searchText !== undefined && followObj.filter.searchText !== null && followObj.filter.searchText !== "") {
    //                 followingId.match = {
    //                     $or: [
    //                         {
    //                             user_name: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                         {
    //                             email: {
    //                                 $regex: ".*" + followObj.filter.searchText + ".*",
    //                                 $options: "i",
    //                             },
    //                         },
    //                     ]
    //                 }
    //             }
    //         }
    //     }
    // }
    condition = {
      $or: [{ followingId: currUser._id }, { userId: currUser._id }],
    };
    // condition["followingId"] = currUser._id
    // condition["userId"] = currUser._id
    try {
      if (start === undefined || length === undefined) {
        data = await UserFollower.find(condition)
          .populate("userId", "user_name first_name last_name email profile_img")
          .populate("followingId", "user_name first_name last_name email profile_img")
          .sort({
            _id: "desc",
          });
      } else {
        data = await UserFollower.find(condition)
          .populate("userId", "user_name first_name last_name email profile_img title")
          .populate("followingId", "user_name first_name last_name email profile_img title")
          .limit(parseInt(length))
          .skip(start)
          .sort({
            _id: "desc",
          });
      }
      // console.log(data);
      data.forEach((item) => {
        if (item.userId && item.followingId) {
          if (item.userId._id + "" == currUser._id + "") {
            if (friendsList.findIndex((v) => v.userId._id + "" == item.followingId._id + "") == -1) {
              friendsList.push({ userId: item.followingId });
            }
          } else {
            if (friendsList.findIndex((v) => v.userId._id + "" == item.userId._id + "") == -1) {
              friendsList.push({ userId: item.userId });
            }
          }
        }
      });
      count = await UserFollower.countDocuments(condition);
      result = {
        data: friendsList,
        total: count,
        currPage: parseInt(start / length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  deleteReq: async function (uId, fId) {
    let result = {};
    try {
      let following = await UserFollowerTemp.findOne({
        userId: uId,
        followingId: fId,
      });

      if (!following) {
        throw Error("Not requested this user");
      }
      result.data = await UserFollowerTemp.deleteOne({
        userId: uId,
        followingId: fId,
      });
      result.followingId = fId;
      // await User.findByIdAndUpdate(currUser._id, { $inc: { following: -1 } })
      // await User.findByIdAndUpdate(id, { $inc: { followers: -1 } })
      return { result, message: "Request Deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  deleteNotification: async function (data) {
    let result = {};
    try {
      result.data = await UserFollowerTemp.findByIdAndDelete(data.id)
    } catch (err) {
      result.err = err.message;
    }
    return result;
  }
};

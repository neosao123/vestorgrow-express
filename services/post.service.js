const Post = require("../models/Post.model");
const UserFollower = require("../models/UserFollower.model");
const UserPostHidden = require("../models/UserPostHidden.model");
const PostLike = require("../models/PostLike.model");
const PostShare = require("../models/PostShare.model");
const UserBlocked = require("../models/UserBlocked.model");
const Notifcation = require("../models/Notification.model");

module.exports = {
  add: async function (post, currUser) {
    let date = new Date();
    post.createdBy = currUser._id;
    post.lastActivityDate = date;
    let result = {};
    try {
      result.data = await new Post(post).save();
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  edit: async function (body) {
    let result = {};
    try {
      if (body && body._id) {
        result.data = await Post.findByIdAndUpdate(body._id, { $set: body }, { new: true });
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
      result.data = await Post.findByIdAndDelete(id);
      if (result.data.originalPostId && result.data.originalPostId !== undefined && result.data.originalPostId !== "") {
      } else {
        await Post.deleteMany({ originalPostId: id });
        toBeDeleted = [...result.data.mediaFiles];
      }
      result.toBeDeleted = toBeDeleted;
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (postObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let blockedUserList = await UserBlocked.find({ userId: currUser._id });
    let blockedUserArr = blockedUserList.map((i) => i.blockedId + "");
    let postLikeList = await PostLike.find({ createdBy: currUser._id }, { postId: 1, _id: 0 });
    let hiddenPostList = await UserPostHidden.find({ userId: currUser._id });
    let followingListData = await UserFollower.find({ userId: currUser._id }, { followingId: 1, _id: 0 });
    let sharedPostUserList = await PostShare.find({ sharedTo: currUser._id }, { sharedBy: 1, _id: 0 });
    let followingArr = followingListData.map((i) => {
      if (!blockedUserArr.includes(i.followingId + "")) {
        return i.followingId + "";
      }
    });
    let sharedPostUserArr = sharedPostUserList.map((i) => {
      if (!blockedUserArr.includes(i.sharedBy + "")) {
        return i.sharedBy;
      }
    });
    let likeArr = postLikeList.map((i) => i.postId + "");
    followingArr.push(currUser._id);
    sharedPostUserArr.push(currUser._id);
    if (
      postObj.filter.createdBy !== undefined &&
      postObj.filter.createdBy !== null &&
      postObj.filter.createdBy !== ""
    ) {
      condition["createdBy"] = postObj.filter.createdBy;
    } else if (
      postObj.filter.shareType !== undefined &&
      postObj.filter.shareType !== null &&
      postObj.filter.shareType !== ""
    ) {
      condition["shareType"] = postObj.filter.shareType;
      // condition = { $and: [{ shareType: postObj.filter.shareType }, { createdBy: { $nin: blockedUserArr } }] }
    } else {
      condition = {
        $and: [
          {
            $or: [
              {
                $and: [{ shareType: "Friends" }, { createdBy: { $in: followingArr } }],
              },
              {
                $and: [{ shareType: "Only me" }, { createdBy: currUser._id }],
              },
              {
                $and: [{ shareType: "Selected" }, { createdBy: { $in: sharedPostUserArr } }],
              },
              {
                $and: [{ shareType: "Public" }, { createdBy: { $in: followingArr } }],
              },
            ],
          },
          {
            $or: [{ is_hidden: false }, { createdBy: currUser._id }],
          },
        ],
      };
    }
    if (postObj.filter !== undefined) {
      if (
        postObj.filter.is_active !== undefined &&
        postObj.filter.is_active !== null &&
        postObj.filter.is_active !== ""
      ) {
        condition["is_active"] = postObj.filter.is_active;
      }
    }
    try {
      // console.log(condition);
      if (postObj.start === undefined || postObj.length === undefined) {
        data = await Post.find(condition).populate("createdBy").sort({
          createdAt: "desc",
        });
      } else {
        data = await Post.find(condition)
          .populate("createdBy")
          .limit(parseInt(postObj.length))
          .skip(postObj.start)
          .sort({
            createdAt: "desc",
          });
      }

      count = await Post.countDocuments(condition);
      let hiddenPostIdsArr = hiddenPostList.map((i) => i.postId + "");
      for (let post of data) {
        post._doc.isHidden = false;
        post._doc.isLiked = false;
        if (hiddenPostIdsArr.includes(post._id + "")) {
          post._doc.isHidden = true;
        }
        if (likeArr.includes(post._id + "")) {
          post._doc.isLiked = true;
        }
      }
      result = {
        data: data,
        total: count,
        currPage: parseInt(postObj.start / postObj.length) + 1,
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
        result.data = await Post.findById(id).populate("createdBy");
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  sharePost: async function (body, currUser) {
    let result = {};
    let notificationObj = {
      postId: body._id,
      title: "shared your post",
      type: "share",
      createdBy: currUser._id,
      createdFor: body.createdBy,
    };
    delete body._id;
    delete body.commentCount;
    delete body.shareCount;
    delete body.likeCount;
    delete body.createdAt;
    delete body.updatedAt;
    try {
      body.createdBy = currUser._id;
      result.data = await new Post(body).save();
      await Post.findByIdAndUpdate(body.parentPostId, {
        $inc: { shareCount: 1 },
      });
      if (notificationObj.createdBy + "" !== notificationObj.createdFor + "") {
        await new Notifcation(notificationObj).save();
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  sharePostList: async function (likeObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let createdBy = { path: "createdBy" };
    const { start, length } = likeObj;
    if (likeObj.filter !== undefined) {
      if (
        likeObj.filter.searchText !== undefined &&
        likeObj.filter.searchText !== null &&
        likeObj.filter.searchText !== ""
      ) {
        createdBy.match = {
          $or: [
            {
              user_name: {
                $regex: ".*" + likeObj.filter.searchText + ".*",
                $options: "i",
              },
            },
            {
              email: {
                $regex: ".*" + likeObj.filter.searchText + ".*",
                $options: "i",
              },
            },
          ],
        };
      }
      if (likeObj.filter.postId !== undefined && likeObj.filter.postId !== null && likeObj.filter.postId !== "") {
        condition["originalPostId"] = likeObj.filter.postId;
      }
    }
    try {
      if (start === undefined || length === undefined) {
        data = await Post.find(condition)
          .populate(createdBy)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.createdBy != null));
      } else {
        data = await Post.find(condition)
          .populate(createdBy)
          .limit(parseInt(length))
          .skip(start)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.createdBy != null));
      }

      count = await Post.countDocuments(condition);
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

const Post = require("../models/Post.model");
const UserFollower = require("../models/UserFollower.model");
const UserPostHidden = require("../models/UserPostHidden.model");
const PostLike = require("../models/PostLike.model");
const PostShare = require("../models/PostShare.model");
const UserBlocked = require("../models/UserBlocked.model");

module.exports = {
  listAll: async function (postObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let sortBy = { createdAt: "desc" };
    let postLikeList = await PostLike.find({ createdBy: currUser._id }, { postId: 1, _id: 0 });
    let hiddenPostList = await UserPostHidden.find({ userId: currUser._id });
    let blockedUserList = await UserBlocked.find({ userId: currUser._id });
    let blockedUserArr = blockedUserList.map((i) => i.blockedId);
    // let followingListData = await UserFollower.find({ userId: currUser._id }, { followingId: 1, _id: 0 });
    // let sharedPostUserList = await PostShare.find({ sharedTo: currUser._id }, { sharedBy: 1, _id: 0 });
    // let followingArr = followingListData.map(i => (i.followingId))
    // let sharedPostUserArr = sharedPostUserList.map(i => (i.sharedBy))
    let likeArr = postLikeList.map((i) => i.postId + "");
    // followingArr.push(currUser._id)
    // sharedPostUserArr.push(currUser._id)
    condition = {
      $and: [
        {
          $and: [
            { shareType: "Public" },
            { createdBy: { $nin: blockedUserArr } },
            // { mediaFiles: { $exists: true, $not: { $size: 0 } } }
          ],
        },
        {
          $or: [{ is_hidden: false }, { createdBy: currUser._id }],
        },
      ],
    };
    if (postObj.filter !== undefined) {
      if (postObj.filter.searchText !== undefined && postObj.filter.searchText !== "") {
        condition["message"] = {
          $regex: ".*" + postObj.filter.searchText + ".*",
          $options: "i",
        };
      }
      if (
        postObj.filter.is_active !== undefined &&
        postObj.filter.is_active !== null &&
        postObj.filter.is_active !== ""
      ) {
        condition["is_active"] = postObj.filter.is_active;
      }
    }
    if (postObj.sortBy !== undefined) {
      sortBy = postObj.sortBy;
    }
    try {
      if (postObj.start === undefined || postObj.length === undefined) {
        data = await Post.find(condition).populate("createdBy").sort(sortBy);
      } else {
        data = await Post.find(condition)
          .populate("createdBy")
          .limit(parseInt(postObj.length))
          .skip(postObj.start)
          .sort(sortBy);
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

  listAllPublic: async function (postObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let sortBy = { createdAt: "desc" };
    condition = {
      shareType: "Public",
      is_hidden: false,
    };
    try {
      data = await Post.find(condition).populate("createdBy").limit(15).skip(0).sort(sortBy);

      count = await Post.countDocuments(condition);
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

  getDetail: async function (id, currUser) {
    let result = {};
    try {
      if (id) {
        let likeArr = [];
        let hiddenPostIdsArr = [];
        if (currUser) {
          let postLikeList = await PostLike.find({ createdBy: currUser._id }, { postId: 1, _id: 0 });
          let hiddenPostList = await UserPostHidden.find({ userId: currUser._id });
          likeArr = postLikeList.map((i) => i.postId + "");
          hiddenPostIdsArr = hiddenPostList.map((i) => i.postId + "");
        }
        let post = await Post.findById(id).populate("createdBy");
        post._doc.isHidden = false;
        post._doc.isLiked = false;
        if (currUser) {
          if (hiddenPostIdsArr.includes(post._id + "")) {
            post._doc.isHidden = true;
          }
          if (likeArr.includes(post._id + "")) {
            post._doc.isLiked = true;
          }
        }

        result.data = post;
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

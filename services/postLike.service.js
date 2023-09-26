const PostLike = require("../models/PostLike.model");
const Post = require("../models/Post.model");
const Notifcation = require("../models/Notification.model");
const UserFollower = require("../models/UserFollower.model");
const UserBlocked = require("../models/UserBlocked.model");
const UserFollowerTemp = require("../models/UserFollowerTemp.model");

module.exports = {
  save: async function (like, currUser) {
    let result = {};
    like.createdBy = currUser._id;
    let notificationObj = {
      postId: like.postId,
      title: "liked your post",
      type: like.type,
      createdBy: currUser._id,
    };
    try {
      let availableData = await PostLike.find({ postId: like.postId, type: like.type, createdBy: like.createdBy });
      if (availableData < 1) {
        const postLike = await new PostLike(like).save();
        const reactionsCount = await PostLike.countDocuments({ postId: like.postId });
        let post = await Post.findByIdAndUpdate(like.postId, {
          $set: { likeCount: reactionsCount },
        }, { new: true });
        notificationObj.createdFor = post.createdBy;
        if (notificationObj.createdBy + "" !== notificationObj.createdFor + "") {
          await new Notifcation(notificationObj).save();
        }

        const postData = await Post.findById(like.postId).populate("createdBy");
        postData._doc.reaction = {
          _id: postLike._id,
          postId: postLike.postId,
          type: postLike.type
        };
        postData._doc.postReactions = await PostLike.distinct('type', { postId: { $in: [like.postId] } });       

        if (like.type === "insight") {
          result.message = `Post marked as insightful successfully`;
        } else if (like.type = "love") {
          result.message = `Post marked as loved successfully`;
        } else {
          result.message = `Post liked successfully`;
        }
        
        result.data = postLike;       
        result.postLikeData = postData;

      } else {
        result.err = "You have already reacted to the post";
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
        result.data = await PostLike.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        return { message: "Updated Successfully" };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  delete: async function (id, currUser) {
    let result = {};
    try {
      const postLike = await PostLike.findOneAndDelete({ postId: id, createdBy: currUser._id });
      const reactionsCount = await PostLike.countDocuments({ postId: id });
      await Post.findByIdAndUpdate(result.data.postId, { $set: { likeCount: reactionsCount } });

      const postData = await Post.findById(like.postId).populate("createdBy");
      postData._doc.reaction = {
        _id: postLike._id,
        postId: postLike.postId,
        type: postLike.type
      };
      postData._doc.postReactions = await PostLike.distinct('type', { postId: { $in: [like.postId] } });  
      result.data = postLike;
      result.postLikeData = postData;
      result.message = "Reaction removed successfully";
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (likeObj, currUser) {
    let result = {};
    try {
      let data = null;
      let count;
      let likeCount;
      let loveCount;
      let insightCount;
      let condition = {};
      let createdBy = { path: "createdBy" };

      let followingListData = await UserFollower.find({ userId: currUser._id }, { followingId: 1, _id: 0 });
      let blockedUserList = await UserBlocked.find({ userId: currUser._id });

      let requestedListData = await UserFollowerTemp.find({ userId: currUser._id }, { followingId: 1, _id: 0 });
      let requestedArr = requestedListData.map((r) => { return r.followingId + "" });

      let blockedUserArr = blockedUserList.map((i) => i.blockedId + "");
      let followingArr = followingListData.map((i) => {
        if (!blockedUserArr.includes(i.followingId + "")) {
          return i.followingId + "";
        }
      });

      const { start, length } = likeObj;
      if (likeObj.filter !== undefined) {
        if (
          likeObj.filter.searchText !== undefined &&
          likeObj.filter.searchText !== null &&
          likeObj.filter.searchText !== ""
        ) {
          // createdBy.match = {
          //   $or: [
          //     {
          //       user_name: {
          //         $regex: ".*" + likeObj.filter.searchText + ".*",
          //         $options: "i",
          //       },
          //     },
          //     {
          //       email: {
          //         $regex: ".*" + likeObj.filter.searchText + ".*",
          //         $options: "i",
          //       },
          //     },
          //   ],
          // };
          const pattern = `^${likeObj.filter.searchText}`;
          createdBy.match = {
            $or: [
              {
                user_name: {
                  $regex: pattern,
                  $options: "i",
                },
              }
            ],
          };
        }
        if (likeObj.filter.postId !== undefined && likeObj.filter.postId !== null && likeObj.filter.postId !== "") {
          condition["postId"] = likeObj.filter.postId;
        }
        if (likeObj.filter.type !== undefined && likeObj.filter.type !== null && likeObj.filter.type !== "") {
          condition["type"] = likeObj.filter.type;
        }
      }

      if (start === undefined || length === undefined) {
        data = await PostLike.find(condition)
          .populate(createdBy)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.createdBy != null));
      } else {
        data = await PostLike.find(condition)
          .populate(createdBy)
          .limit(parseInt(length))
          .skip(start)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.createdBy != null));
      }

      count = await PostLike.countDocuments(condition);
      if (likeObj.filter.postId !== undefined && likeObj.filter.postId !== null && likeObj.filter.postId !== "") {
        likeCount = await PostLike.countDocuments({ "type": "like", postId: likeObj.filter.postId });
        loveCount = await PostLike.countDocuments({ "type": "love", postId: likeObj.filter.postId });
        insightCount = await PostLike.countDocuments({ "type": "insight", postId: likeObj.filter.postId });
      }

      if (data.length > 0) {
        for (let usr of data) {
          const nid = usr.createdBy._id + "";
          var isFollowing = 0;
          if (followingArr.includes(nid)) {
            isFollowing = 1;
          } else if (requestedArr.includes(nid)) {
            isFollowing = 2;
          } else {
            isFollowing = 0;
          }
          usr._doc.isFollowing = isFollowing;
        }
      }

      result = {
        data: data,
        total: count,
        currPage: parseInt(start / length) + 1,
        likeCount: likeCount,
        loveCount: loveCount,
        insightCount: insightCount
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
        result.data = await PostLike.findById(id);
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  updateAllType: async function () {
    let result = {};
    try {
      result.data = await PostLike.updateMany({}, { $set: { type: "like" } }, { new: true });
      return { message: "Updated Successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  getPostUniqueReactions: async function (postId) {
    let result = {};
    try {

      const distinctReactions = await PostLike.distinct('type', { postId: { $in: [postId] } });
      if (distinctReactions) {
        result.data = distinctReactions;
      } else {
        result.err = "Post not found";
      }

    } catch (err) {
      result.err = err.message;
    }
    return result;
  }

};

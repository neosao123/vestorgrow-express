const PostLike = require("../models/PostLike.model");
const Post = require("../models/Post.model");
const Notifcation = require("../models/Notification.model");

module.exports = {
  save: async function (like, currUser) {
    let result = {};
    like.createdBy = currUser._id;
    let notificationObj = {
      postId: like.postId,
      title: "liked your post",
      type: "like",
      createdBy: currUser._id,
    };
    try {
      let availableData = await PostLike.find({ postId: like.postId, createdBy: like.createdBy });
      if (availableData < 1) {
        result.data = await new PostLike(like).save();
        let post = await Post.findByIdAndUpdate(like.postId, {
          $inc: { likeCount: 1 },
        });
        notificationObj.createdFor = post.createdBy;
        console.log(notificationObj.createdBy, "!==", notificationObj.createdFor);
        if (notificationObj.createdBy + "" !== notificationObj.createdFor + "") {
          await new Notifcation(notificationObj).save();
        }
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
      result.data = await PostLike.findOneAndDelete({ postId: id, createdBy: currUser._id });
      await Post.findByIdAndUpdate(result.data.postId, { $inc: { likeCount: -1 } });
      return { message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (likeObj, currUser) {
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
        condition["postId"] = likeObj.filter.postId;
      }
    }
    try {
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
        result.data = await PostLike.findById(id);
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

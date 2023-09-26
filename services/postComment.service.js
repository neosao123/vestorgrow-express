const PostComment = require("../models/PostComment.model");
const Post = require("../models/Post.model");
const PostReply = require("../models/CommentReply.model");
const ReplyLike = require("../models/ReplyLike.model");
const CommentLike = require("../models/CommentLike.model");
const Notifcation = require("../models/Notification.model");

module.exports = {
  save: async function (comment) {
    let result = {};

    try {

      let date = new Date();
      let notificationObj = {
        postId: comment.postId,
        title: "commented on your post",
        type: "comment",
        createdBy: comment.createdBy,
      };

      let mentUsers = comment.mentionedUsers ?? [];
      delete comment.mentionedUsers;

      result.data = await new PostComment(comment).save();

      let post = await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: 1 },
        $set: { lastActivityDate: date },
      }, { new: true });

      result.postCreatedBy = post.createdBy;
      result.commentBy = comment.createdBy;

      if (comment.createdBy.toString() !== post.createdBy.toString()) {
        notificationObj.createdFor = post.createdBy;
        await new Notifcation(notificationObj).save();
      }

      if (mentUsers.length > 0) {
        mentUsers.map((mentionedUser) => {
          if (comment.createdBy + "" !== mentionedUser + "") {
            let notificationObj = {
              postId: comment.postId,
              title: " tagged you in a comment",
              type: "Tagged",
              createdBy: comment.createdBy,
              createdFor: mentionedUser,
            };
            new Notifcation(notificationObj).save();
          }
        });
      }
      
      result.postCommentData = await PostComment.findById(result.data._id).populate("createdBy");

    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  edit: async function (body) {
    let result = {};
    try {
      if (body && body._id) {
        result.data = await PostComment.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        result.message = "Updated Successfully";
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  delete: async function (id) {
    let result = {};
    try {
      result.data = await PostComment.findByIdAndDelete(id);
      await PostReply.deleteMany({ commentId: id });
      await Post.findByIdAndUpdate(result.data.postId, { $inc: { commentCount: -1 } });
      result.message = "Record deleted successfully";
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (commentObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};

    const { start, length } = commentObj;
    if (commentObj.filter !== undefined) {
      if (
        commentObj.filter.postId !== undefined &&
        commentObj.filter.postId !== null &&
        commentObj.filter.postId !== ""
      ) {
        condition["postId"] = commentObj.filter.postId;
      }
    }
    try {
      if (start === undefined || length === undefined) {
        data = await PostComment.find(condition).populate("createdBy").sort({
          _id: "desc",
        });
      } else {
        data = await PostComment.find(condition).populate("createdBy").limit(parseInt(length)).skip(start).sort({
          _id: "desc",
        });
      }

      count = await PostComment.countDocuments(condition);
      for (let i = 0; data.length > i; i++) {
        let commentLikeCheck = await CommentLike.exists({ commentId: data[i]._id, createdBy: currUser._id });
        let commentLiked = false;
        if (commentLikeCheck) {
          commentLiked = true;
        }
        data[i]._doc.isLiked = commentLiked;
        reply = await PostReply.find({ commentId: data[i]._id }).populate("createdBy").sort({ _id: "desc" });
        for (let j = 0; reply.length > j; j++) {
          let isLiked = false;
          let replyLikeCheck = await ReplyLike.exists({ replyId: reply[j]._id, createdBy: currUser._id });
          if (replyLikeCheck) {
            isLiked = true;
          }
          reply[j]._doc.isLiked = isLiked;
        }
        data[i]._doc.replies = reply;
      }
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
        result.data = await PostComment.findById(id);
      } else {
        result.err = "Record not found";
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

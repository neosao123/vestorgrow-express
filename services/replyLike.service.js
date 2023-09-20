const ReplyLike = require("../models/ReplyLike.model");
const CommentReply = require("../models/CommentReply.model");

module.exports = {
    save: async function (comment, currUser) {
        let result = {};
        // let date = new Date()
        comment.createdBy = currUser._id
        try {
            await CommentReply.findByIdAndUpdate(comment.replyId, { $inc: { likeCount: 1 } });
            result.data = await new ReplyLike(comment).save();
            result.message = "Comment added sucessfully";
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await ReplyLike.findByIdAndUpdate(
                    body._id,
                    { $set: body },
                    { new: true }
                );
                result.message = "Updated Successfully";
            } else {
                result.err = "Invalid paramerter or missing paramters";
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    delete: async function (id, currUser) {
        let result = {};
        try {
            result.data = await ReplyLike.findOneAndDelete({ replyId: id, createdBy: currUser._id });
            await CommentReply.findByIdAndUpdate(result.data.replyId, { $inc: { likeCount: -1 } })
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
                data = await ReplyLike.find(condition).populate("createdBy").sort({
                    _id: "desc",
                });
            } else {
                data = await ReplyLike.find(condition).populate("createdBy")
                    .limit(parseInt(length))
                    .skip(start)
                    .sort({
                        _id: "desc",
                    });
            }
            count = await ReplyLike.countDocuments(condition);
            result = {
                message: count > 0 ? "Data found" : "Data not found",
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
                const replyLike = await ReplyLike.findById(id);
                if (replyLike) {
                    result.message = "Data Found";
                    result.data = replyLike;
                } else {
                    result.err = "Data not found";
                }
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

const CommentReply = require("../models/CommentReply.model");
const Post = require("../models/Post.model");

module.exports = {
    save: async function (comment) {
        let result = {};
        let date = new Date()
        try {
            result.data = await new CommentReply(comment).save();
            // await Post.findByIdAndUpdate(
            //     comment.postId,
            //     {
            //         $inc: { commentCount: 1 },
            //         $set: { lastActivityDate: date }
            //     })
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await CommentReply.findByIdAndUpdate(
                    body._id,
                    { $set: body },
                    { new: true }
                );
                return { message: "Updated Successfully" };
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    delete: async function (id) {
        let result = {};
        try {
            result.data = await CommentReply.findByIdAndDelete(id);
            // await Post.findByIdAndUpdate(result.data.postId, { $inc: { commentCount: -1 } })
            return { message: "Record deleted successfully" };
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
                data = await CommentReply.find(condition).populate("createdBy").sort({
                    _id: "desc",
                });
            } else {
                data = await CommentReply.find(condition).populate("createdBy")
                    .limit(parseInt(length))
                    .skip(start)
                    .sort({
                        _id: "desc",
                    });
            }

            count = await CommentReply.countDocuments(condition);
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
                result.data = await CommentReply.findById(id);
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

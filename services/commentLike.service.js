const CommentLike = require("../models/CommentLike.model");
const PostComment = require("../models/PostComment.model");

module.exports = {
    save: async function (comment, currUser) {
        let result = {};
        // let date = new Date()
        comment.createdBy = currUser._id
        try {
            result.data = await new CommentLike(comment).save();
            await PostComment.findByIdAndUpdate(
                comment.commentId,
                {
                    $inc: { likeCount: 1 },
                })
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await CommentLike.findByIdAndUpdate(
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
    delete: async function (id, currUser) {
        let result = {};
        try {
            result.data = await CommentLike.findOneAndDelete({ commentId: id, createdBy: currUser._id });
            await PostComment.findByIdAndUpdate(result.data.commentId, { $inc: { likeCount: -1 } })
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
                data = await CommentLike.find(condition).populate("createdBy").sort({
                    _id: "desc",
                });
            } else {
                data = await CommentLike.find(condition).populate("createdBy")
                    .limit(parseInt(length))
                    .skip(start)
                    .sort({
                        _id: "desc",
                    });
            }

            count = await CommentLike.countDocuments(condition);
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
                result.data = await CommentLike.findById(id);
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

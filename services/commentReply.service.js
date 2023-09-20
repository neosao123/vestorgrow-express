const CommentReply = require("../models/CommentReply.model");
const Notification = require("../models/Notification.model");
const Post = require("../models/Post.model");

module.exports = {
    save: async function (comment) {
        let result = {};
        try {

            let date = new Date();
            let mentUsers = comment.mentionedUsers ?? [];
            delete comment.mentionedUsers;

            result.data = await new CommentReply(comment).save();

            if (mentUsers.length > 0) {
                mentUsers.map((mentionedUser) => {
                    if (comment.createdBy + "" !== mentionedUser + "") {
                        let notificationObj = {
                            postId: comment.postId,
                            title: " tagged you in a comments reply",
                            type: "Tagged",
                            createdBy: comment.createdBy,
                            createdFor: mentionedUser,
                        };
                        new Notification(notificationObj).save();
                    }
                });
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
                result.data = await CommentReply.findByIdAndUpdate(
                    body._id,
                    { $set: body },
                    { new: true }
                );
                result.message = "Updated Successfully";
            } else {
                result.err = "Invalid parameters or missing";
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
                result.err = "Record not found";
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    }
};

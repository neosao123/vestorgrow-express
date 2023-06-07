const PostShare = require("../models/PostShare.model");
const Post = require("../models/Post.model");

module.exports = {
    save: async function (data, currUser) {
        let result = {};
        // data.createdBy = currUser._id
        try {
            result.data = await new PostShare(data).save();
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await PostShare.findByIdAndUpdate(
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
            result.data = await PostShare.findOneAndDelete({ postId: id, createdBy: currUser._id });
            return { message: "Record deleted successfully" };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    listAll: async function (dataObj, currUser) {
        let result = {};
        let data = null;
        let count;
        let condition = {};

        const { start, length } = dataObj;
        if (dataObj.filter !== undefined) {
            if (
                dataObj.filter.postId !== undefined &&
                dataObj.filter.postId !== null &&
                dataObj.filter.postId !== ""
            ) {
                condition["postId"] = dataObj.filter.postId;
            }

        }
        try {
            if (start === undefined || length === undefined) {
                data = await PostShare.find(condition).sort({
                    _id: "desc",
                });
            } else {
                data = await PostShare.find(condition)
                    .limit(parseInt(length))
                    .skip(start)
                    .sort({
                        _id: "desc",
                    });
            }

            count = await PostShare.countDocuments(condition);
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
                result.data = await PostShare.findById(id);
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

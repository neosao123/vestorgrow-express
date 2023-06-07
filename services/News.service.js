const News = require("../models/News.model");

module.exports = {
    save: async function (news) {
        let result = {};
        try {
            result.data = await new News(news).save();
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await News.findByIdAndUpdate(
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
            result.data = await News.findByIdAndDelete(id);
            return { message: "Record deleted successfully" };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    listAll: async function (newsObj, currUser) {
        let result = {};
        let data = null;
        let count;
        let condition = {};

        const { start, length } = newsObj;
        if (newsObj.filter !== undefined) {
            if (newsObj.filter.searchText !== undefined) {
                condition["title"] = {
                    $regex: ".*" + newsObj.filter.searchText + ".*",
                    $options: "i",
                }

            }
            if (
                newsObj.filter.is_viewed !== undefined &&
                newsObj.filter.is_viewed !== null &&
                newsObj.filter.is_viewed != ""
            ) {
                condition["is_viewed"] = newsObj.filter.is_viewed;
            }

        }
        condition["createdFor"] = currUser._id
        try {
            if (start === undefined || length === undefined) {
                data = await News.find(condition).populate("createdBy").sort({
                    createdAt: "desc",
                });
            } else {
                data = await News.find(condition).populate("createdBy")
                    .limit(parseInt(length))
                    .skip(start)
                    .sort({
                        createdAt: "desc",
                    });
            }

            count = await News.countDocuments(condition);
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
                result.data = await News.findById(id);
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

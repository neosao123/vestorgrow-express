const Webinar = require("../models/Webinar.model");

module.exports = {
    add: async function (webinar, currUser) {
        webinar.created_by = currUser._id
        let result = {};
        try {
            result.data = await new Webinar(webinar).save();
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await Webinar.findByIdAndUpdate(
                    body._id,
                    { $set: body },
                    { new: true }
                );
                return { message: "Updated Successfully", result };
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    delete: async function (id) {
        let result = {};
        let toBeDeleted = []
        try {
            result.data = await Webinar.findByIdAndDelete(id);
            toBeDeleted.push(result.data.banner_image)
            toBeDeleted.push(result.data.video)
            result.toBeDeleted = toBeDeleted
            return { result, message: "Record deleted successfully" };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    listAll: async function (webinarObj, currUser) {
        let result = {};
        let data = null;
        let count;
        let condition = {};
        let sortBy = { createdAt: "desc", }
        if (webinarObj.filter !== undefined) {
            if (webinarObj.filter.searchText !== undefined) {
                condition = {
                    $or: [
                        {
                            title: {
                                $regex: ".*" + webinarObj.filter.searchText + ".*",
                                $options: "i",
                            },
                        }
                    ],
                };
            }
            if (
                webinarObj.filter.is_active !== undefined &&
                webinarObj.filter.is_active !== null &&
                webinarObj.filter.is_active != ""
            ) {
                condition["is_active"] = webinarObj.filter.is_active;
            }
            if (
                webinarObj.filter.categoryId !== undefined &&
                webinarObj.filter.categoryId !== null &&
                webinarObj.filter.categoryId.length != 0
            ) {
                condition["categoryId"] = { $in: webinarObj.filter.categoryId };
            }
        }
        if (webinarObj.sortBy !== undefined) {
            sortBy = webinarObj.sortBy
        }

        try {
            if (webinarObj.start === undefined || webinarObj.length === undefined) {
                data = await Webinar.find(condition).populate("createdBy").sort(sortBy);
            } else {
                data = await Webinar.find(condition)
                    .populate("createdBy")
                    .limit(parseInt(webinarObj.length))
                    .skip(webinarObj.start)
                    .sort(sortBy);
            }

            count = await Webinar.countDocuments(condition);
            result = {
                data: data,
                total: count,
                currPage: parseInt(webinarObj.start / webinarObj.length) + 1,
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
                result.data = await Webinar.findById(id).populate("createdBy");
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    changeActive: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await Webinar.findByIdAndUpdate(
                    body._id,
                    { $set: body },
                    { new: true }
                );
                return { message: "Updated Successfully", result };
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

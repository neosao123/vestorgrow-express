const Banner = require("../models/Banner.model");

module.exports = {
    add: async function (banner, currUser) {
        banner.created_by = currUser._id
        let result = {};
        try {
            result.data = await new Banner(banner).save();
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await Banner.findByIdAndUpdate(
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
            result.data = await Banner.findByIdAndDelete(id);
            toBeDeleted.push(result.data.banner_image)
            result.toBeDeleted = toBeDeleted
            return { result, message: "Record deleted successfully" };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    listAll: async function (bannerObj, currUser) {
        let result = {};
        let data = null;
        let count;
        let condition = {};
        let sortBy = { createdAt: "desc", }
        if (bannerObj.filter !== undefined) {
            if (bannerObj.filter.searchText !== undefined) {
                condition = {
                    $or: [
                        {
                            title: {
                                $regex: ".*" + bannerObj.filter.searchText + ".*",
                                $options: "i",
                            },
                        }
                    ],
                };
            }
            if (
                bannerObj.filter.is_active !== undefined &&
                bannerObj.filter.is_active !== null &&
                bannerObj.filter.is_active != ""
            ) {
                condition["is_active"] = bannerObj.filter.is_active;
            }
            if (
                bannerObj.filter.location !== undefined &&
                bannerObj.filter.location !== null &&
                bannerObj.filter.location.length != ""
            ) {
                condition["location"] = { $in: bannerObj.filter.location };
            }
        }
        if (bannerObj.sortBy !== undefined) {
            sortBy = bannerObj.sortBy
        }

        try {
            if (bannerObj.start === undefined || bannerObj.length === undefined) {
                data = await Banner.find(condition).sort(sortBy);
            } else {
                data = await Banner.find(condition)
                    .limit(parseInt(bannerObj.length))
                    .skip(bannerObj.start)
                    .sort(sortBy);
            }

            count = await Banner.countDocuments(condition);
            result = {
                data: data,
                total: count,
                currPage: parseInt(bannerObj.start / bannerObj.length) + 1,
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
                result.data = await Banner.findById(id);
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
                result.data = await Banner.findByIdAndUpdate(
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

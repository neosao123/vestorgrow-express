const LearningMaterialCategory = require("../models/LearningMaterialCategory.model");

module.exports = {
    save: async function (category) {
        let result = {};
        try {
            result.data = await new LearningMaterialCategory(category).save();
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    edit: async function (body) {
        let result = {};
        try {
            if (body && body._id) {
                result.data = await LearningMaterialCategory.findByIdAndUpdate(
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
            result.data = await LearningMaterialCategory.findByIdAndDelete(id);
            return { message: "Record deleted successfully" };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },

    listAll: async function (categoryObj, currUser) {
        let result = {};
        let data = null;
        let count;
        let condition = {};

        const { start, length } = categoryObj;
        if (categoryObj.filter !== undefined) {
            if (categoryObj.filter.searchText !== undefined) {
                condition["name"] = {
                    $regex: ".*" + categoryObj.filter.searchText + ".*",
                    $options: "i",
                }

            }
            if (
                categoryObj.filter.is_active !== undefined &&
                categoryObj.filter.is_active !== null &&
                categoryObj.filter.is_active != ""
            ) {
                condition["is_active"] = categoryObj.filter.is_active;
            }

        }
        try {
            if (start === undefined || length === undefined) {
                data = await LearningMaterialCategory.find(condition).sort({
                    name: "asc",
                });
            } else {
                data = await LearningMaterialCategory.find(condition)
                    .limit(parseInt(length))
                    .skip(start)
                    .sort({
                        name: "asc",
                    });
            }

            count = await LearningMaterialCategory.countDocuments(condition);
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
                result.data = await LearningMaterialCategory.findById(id);
            } else {
                result.err = ["Record not found"];
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

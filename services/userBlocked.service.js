const UserBlocked = require("../models/UserBlocked.model");
const User = require("../models/User.model");

module.exports = {
    save: async function (data, currUser) {
        let result = {};
        try {
            let checkUser = await UserBlocked.findOne({ userId: currUser._id, blockedId: data.blockedId })
            if (checkUser) {
                throw Error("This user is already blocked")
            }
            data.userId = currUser._id
            result.data = await new UserBlocked(data).save();

        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
    unblock: async function (id, currUser) {
        let result = {};
        try {
            let checkUser = await UserBlocked.findOne({ userId: currUser._id, blockedId: id })

            if (!checkUser) {
                throw Error("User is already unblocked")
            }
            result.data = await UserBlocked.deleteOne({ userId: currUser._id, blockedId: id })
            return { message: "Unblocked user successfully" };
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
        let userCondition = {}
        userCondition.userId = currUser._id
        const { start, length } = dataObj;
        condition["userId"] = currUser._id
        if (dataObj.filter !== undefined) {
            // if (dataObj.filter.searchText !== undefined) {
            //     condition = {
            //         $or: [
            //             {
            //                 first_name: {
            //                     $regex: ".*" + dataObj.filter.searchText + ".*",
            //                     $options: "i",
            //                 },
            //             },
            //             {
            //                 last_name: {
            //                     $regex: ".*" + dataObj.filter.searchText + ".*",
            //                     $options: "i",
            //                 },
            //             },
            //         ],
            //     };
            // }
            if (
                dataObj.filter.is_active !== undefined &&
                dataObj.filter.is_active !== null &&
                dataObj.filter.is_active != ""
            ) {
                condition["is_active"] = dataObj.filter.is_active;
            }
        }
        try {
            if (start === undefined || length === undefined) {
                data = await UserBlocked.find(condition).populate("blockedId").sort({
                    _id: "desc",
                });
            } else {
                data = await UserBlocked.find(condition).populate("blockedId")
                    .limit(parseInt(length))
                    .skip(start)
                    .sort({
                        _id: "desc",
                    });
            }
            count = await UserBlocked.countDocuments(condition);
            if (dataObj.filter !== undefined) {
                if (dataObj.filter.searchText !== undefined && dataObj.filter.searchText !== "") {
                    data = data.filter(item => item.blockedId.user_name.includes(dataObj.filter.searchText)
                    )
                }
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
                result.data = await UserBlocked.findById(id);
            } else {
                throw Error("Record not found");
            }
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
};

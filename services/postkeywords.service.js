const Post = require("../models/Post.model");
const Postkeyword = require("../models/PostKeywords.model");

module.exports = {
    getPopularKeywords: async function () {
        let result = {};
        try {
            result.data = await Postkeyword.find({}).select({ _id: -1, keyword: 1 }).sort({ count: -1 }).limit(8);
            return { message: "Keywords Found", result };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },
}
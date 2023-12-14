const Post = require("../models/Post.model");
const Postkeyword = require("../models/PostKeywords.model");

module.exports = {
    getPopularKeywords: async function (cat) {
        let result = {};
        try {
            let filter = {
                count: {
                    $gte: 1
                }
            }
            if (cat !== "show_all") {
                filter.category = cat
            }
            result.data = await Postkeyword.find(filter).select({ _id: -1, keyword: 1, category: 1 }).sort({ count: -1 }).limit(8);
            return { message: "Keywords Found", result };
        } catch (err) {
            result.err = err.message;
        }
        return result;
    },


}
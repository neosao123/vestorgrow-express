const Post = require("../models/Post.model");
const UserFollower = require("../models/UserFollower.model");
const UserPostHidden = require("../models/UserPostHidden.model");
const PostLike = require("../models/PostLike.model");
const PostShare = require("../models/PostShare.model");
const UserBlocked = require("../models/UserBlocked.model");
const Postkeyword = require("../models/PostKeywords.model");

module.exports = {
  listAll: async function (postObj, page, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let sortBy = { createdAt: "desc" };
    let category = postObj.filter.category.toLowerCase();
    let postLikeList = await PostLike.find({ createdBy: currUser._id }, { postId: 1, _id: 0 });
    let hiddenPostList = await UserPostHidden.find({ userId: currUser._id });
    let blockedUserList = await UserBlocked.find({ userId: currUser._id });
    let blockedUserArr = blockedUserList.map((i) => i.blockedId);
    // let followingListData = await UserFollower.find({ userId: currUser._id }, { followingId: 1, _id: 0 });
    // let sharedPostUserList = await PostShare.find({ sharedTo: currUser._id }, { sharedBy: 1, _id: 0 });
    // let followingArr = followingListData.map(i => (i.followingId))
    // let sharedPostUserArr = sharedPostUserList.map(i => (i.sharedBy))
    let likeArr = postLikeList.map((i) => i.postId + "");
    let pageNumber = page || 1;
    let skip = (parseInt(pageNumber) - 1) * 18;
    // followingArr.push(currUser._id)
    // sharedPostUserArr.push(currUser._id)
    condition = {
      $and: [
        {
          $and: [
            { shareType: "Public" },
            { createdBy: { $nin: blockedUserArr } },
            // { mediaFiles: { $exists: true, $not: { $size: 0 } } }
          ],
        },
        {
          $or: [{ is_hidden: false }, { createdBy: currUser._id }],
        }
      ],
    };
    if (postObj.filter !== undefined) {
      if (postObj.filter.searchText !== undefined && postObj.filter.searchText !== "") {
        condition["message"] = {
          $regex: ".*" + postObj.filter.searchText + ".*",
          $options: "i",
        };
      }
      if (
        postObj.filter.is_active !== undefined &&
        postObj.filter.is_active !== null &&
        postObj.filter.is_active !== ""
      ) {
        condition["is_active"] = postObj.filter.is_active;
      }
      if (category !== undefined && category !== "all") {
        const searchKeyword = postObj.filter.keyword;

        condition['postKeywords'] = {
          $in: [category]
        };

      }
      if (postObj.filter.maincategory !== undefined && postObj.filter.maincategory !== "show_all") {
        condition["category"] = postObj.filter.maincategory;
      }
    }
    if (postObj.sortBy !== undefined) {
      sortBy = postObj.sortBy;
    }
    try {
      if (postObj.start === undefined || postObj.length === undefined) {
        data = await Post.find(condition).populate("createdBy").skip(skip).limit(18).sort(sortBy);
      } else {
        data = await Post.find(condition)
          .populate("createdBy")
          .select("category")
          .skip(skip)
          .limit(18)
          .sort(sortBy);
      }

      let postIdArray = data.map((i) => i._id);

      const reactions = await Post.aggregate([
        {
          $lookup: {
            from: 'postlikes',
            localField: '_id',
            foreignField: 'postId',
            as: 'postlikes',
          },
        },
        {
          $unwind: '$postlikes',
        },
        {
          $group: {
            _id: '$_id',
            postId: { $first: '$_id' },
            reactions: { $addToSet: '$postlikes.type' },
          },
        },
        {
          $project: {
            _id: 0,
            postId: 1,
            reactions: 1,
          },
        },
        {
          $match: {
            postId: { $in: postIdArray }
          }
        }
      ]);

      count = await Post.countDocuments(condition);
      let hiddenPostIdsArr = hiddenPostList.map((i) => i.postId + "");
      for (let post of data) {
        post._doc.isHidden = false;
        post._doc.isLiked = false;

        if (hiddenPostIdsArr.includes(post._id + "")) {
          post._doc.isHidden = true;
        }

        if (likeArr.includes(post._id + "")) {
          post._doc.isLiked = true;
        }

        if (reactions.length > 0) {
          const reaction = reactions.filter(reaction => reaction.postId.toString() === post._id.toString());
          if (reaction.length > 0) {
            post._doc.postReactions = reaction[0].reactions;
          }
        }
      }

      const popularKeyowrds = await Postkeyword.find({}).select({ _id: -1, keyword: 1 }).sort({ count: -1 }).limit(8);
      let totalPages = Math.ceil(count / 18);

      result = {
        reactions: reactions,
        data: data,
        total: count,
        popularKeyowrds: popularKeyowrds,
        currPage: parseInt(postObj.start / postObj.length) + 1,
        totalPages
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAllPublic: async function (postObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let sortBy = { createdAt: "desc" };
    condition = {
      shareType: "Public",
      is_hidden: false,
    };
    try {
      data = await Post.find(condition).populate("createdBy").limit(15).skip(0).sort(sortBy);
      count = await Post.countDocuments(condition);
      result = {
        data: data,
        total: count,
        currPage: parseInt(postObj.start / postObj.length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  getDetail: async function (id, currUser) {
    let result = {};
    try {
      if (id) {
        let likeArr = [];
        let hiddenPostIdsArr = [];

        let post = await Post.findById(id).populate({
          path: "originalPostId",
          select: {
            _id: 1
          },
          populate: {
            path: "createdBy",
            model: "User",
            select: {
              _id: 1,
              profile_img: 1,
              user_name: 1,
              role: 1
            }
          }
        }).populate("createdBy");
        post._doc.isHidden = false;
        post._doc.isLiked = false;

        const distinctReactions = await PostLike.distinct('type', { postId: { $in: [id] } });
        post._doc.postReactions = distinctReactions;
        if (currUser) {
          let postLikeList = await PostLike.findOne({ postId: id, createdBy: currUser._id }, { _id: 1, postId: 1, type: 1 });
          let hiddenPostList = await UserPostHidden.find({ userId: currUser._id });
          hiddenPostIdsArr = hiddenPostList.map((i) => i.postId + "");
          if (hiddenPostIdsArr.includes(post._id + "")) {
            post._doc.isHidden = true;
          }
          if (postLikeList) {
            post._doc.isLiked = true;
            post._doc.reaction = postLikeList;
          }
        }

        result.data = post;
      } else {
        result.err = ["Record not found"];
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

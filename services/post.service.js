const Post = require("../models/Post.model");
const UserFollower = require("../models/UserFollower.model");
const UserPostHidden = require("../models/UserPostHidden.model");
const PostLike = require("../models/PostLike.model");
const PostShare = require("../models/PostShare.model");
const UserBlocked = require("../models/UserBlocked.model");
const Notifcation = require("../models/Notification.model");
const Postkeyword = require("../models/PostKeywords.model");
const { default: mongoose } = require("mongoose");
const { post } = require("../routes/post.route");
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
  add: async function (post, currUser) {
    let date = new Date();
    let mentUsers = post.mentionedUsers;
    const postKeywords = post.postKeywords;
    delete post.postKeywords;
    let uniqueKeywords = [];
    if (postKeywords.length > 0) {
      const postTags = postKeywords.split(",");
      const wordsSet = new Set();
      postTags.map((word) => {
        wordsSet.add(word); // Add lowercase word to the set
      });
      uniqueKeywords = Array.from(wordsSet);
      post.postKeywords = uniqueKeywords;
    }
    post.createdBy = currUser._id;
    post.lastActivityDate = date;
    let result = {};
    try {
      result.data = await new Post(post).save();

      if (uniqueKeywords.length > 0) {
        uniqueKeywords.map(async (keyword) => {
          const keyTag = keyword.toLowerCase();
          const keywordData = await Postkeyword.findOne({ keywordSmallCase: keyTag });
          if (keywordData) {
            await Postkeyword.findByIdAndUpdate(keywordData._id, {
              $inc: { count: 1 },
            });
          } else {
            new Postkeyword({ keyword: keyword, keywordSmallCase: keyTag, count: 1 }).save();
          }
        });
      }

      if (mentUsers.length > 0) {
        const mentionedUsers = mentUsers.split(",");
        mentionedUsers.map((mentionedUser) => {
          let notificationObj = {
            postId: result.data._id,
            title: " tagged you in a post",
            type: "Tagged",
            createdBy: currUser._id,
            createdFor: mentionedUser,
          };
          new Notifcation(notificationObj).save();
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
        result.data = await Post.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        return { message: "Updated Successfully", result };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  delete: async function (id) {
    let result = {};
    let toBeDeleted = [];
    try {
      result.data = await Post.findById(id);
      await Post.findByIdAndDelete(id);
      if (result.data.originalPostId && result.data.originalPostId !== undefined && result.data.originalPostId !== "") {
        //do nothing
      } else {
        await Post.deleteMany({ originalPostId: id });
        toBeDeleted = [...result.data.mediaFiles];
      }
      result.toBeDeleted = toBeDeleted;
      return { result, message: "Record deleted successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  listAll: async function (postObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};

    let usrId = currUser._id;

    if (postObj.filter.createdBy !== undefined && postObj.filter.createdBy !== null && postObj.filter.createdBy !== "") {
      if (postObj.filter.createdBy !== currUser._id) {
        usrId = postObj.filter.createdBy;
      }
    }

    let blockedUserList = await UserBlocked.find({ userId: usrId });
    let postLikeList = await PostLike.find({ createdBy: usrId }, { _id: 1, postId: 1, type: 1 });
    let hiddenPostList = await UserPostHidden.find({ userId: usrId });
    let followingListData = await UserFollower.find({ userId: usrId }, { followingId: 1, _id: 0 });
    let sharedPostUserList = await PostShare.find({ sharedTo: usrId }, { sharedBy: 1, _id: 0 });

    let blockedUserArr = blockedUserList.map((i) => i.blockedId + "");
    let followingArr = followingListData.map((i) => {
      if (!blockedUserArr.includes(i.followingId + "")) {
        return i.followingId + "";
      }
    });
    console.log("BLOCKEDUSERARRAY:", blockedUserArr)
    let sharedPostUserArr = sharedPostUserList.map((i) => {
      if (!blockedUserArr.includes(i.sharedBy + "")) {
        return i.sharedBy;
      }
    });
    let likeArr = postLikeList.map((i) => i.postId + "");
    followingArr.push(currUser._id);
    sharedPostUserArr.push(currUser._id);
    if (postObj.filter !== undefined) {
      if (postObj.filter.createdBy !== undefined && postObj.filter.createdBy !== null && postObj.filter.createdBy !== "") {
        condition["createdBy"] = postObj.filter.createdBy;
      } else if (postObj.filter.shareType !== undefined && postObj.filter.shareType !== null && postObj.filter.shareType !== "") {
        condition["shareType"] = postObj.filter.shareType;
        // condition = { $and: [{ shareType: postObj.filter.shareType }, { createdBy: { $nin: blockedUserArr } }] }
      } else {
        condition = {
          $and: [
            {
              $or: [
                {
                  $and: [{ shareType: "Friends" }, { createdBy: { $in: followingArr } }],
                },
                {
                  $and: [{ shareType: "Only me" }, { createdBy: currUser._id }],
                },
                {
                  $and: [{ shareType: "Selected" }, { createdBy: { $in: sharedPostUserArr } }],
                },
                {
                  $and: [{ shareType: "Public" }, { createdBy: { $in: followingArr } }],
                },
              ],
            },
            {
              $or: [{ is_hidden: false }, { createdBy: currUser._id }],
            },
          ],
        };
      }

      if (postObj.filter.is_active !== undefined && postObj.filter.is_active !== null && postObj.filter.is_active !== "") {
        condition["is_active"] = postObj.filter.is_active;
      }
    }
    try {
      if (postObj.start === undefined || postObj.length === undefined) {
        data = await Post.find(condition).populate("createdBy").populate({
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
        }).sort({
          createdAt: "desc",
        });
      } else {
        data = await Post.find(condition)
          .populate("createdBy")
          .populate({
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
          })
          .limit(parseInt(postObj.length))
          .skip(postObj.start)
          .sort({
            createdAt: "desc",
          });
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
          var filteredReaction = postLikeList.filter(postLike => postLike.postId.toString() === post._id.toString());
          post._doc.reaction = filteredReaction.length > 0 ? filteredReaction[0] : {};
        }

        let postReactions = [];
        if (reactions.length > 0) {
          const reaction = reactions.filter(reaction => reaction.postId.toString() === post._id.toString());
          if (reaction.length > 0) {
            postReactions = reaction[0].reactions;
          }
        }
        post._doc.postReactions = postReactions;
      }
      result = {
        // reactions: reactions,
        // reactionsLength: reactions.length,
        data: data,
        total: count,
        currPage: parseInt(postObj.start / postObj.length) + 1
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
        const post = await Post.findById(id).populate("createdBy");

        const distinctReactions = await PostLike.distinct('type', { postId: { $in: [id] } });

        if (post) {
          post._doc.postReactions = distinctReactions
          result.data = post;
        } else {
          result.err = "Post not found";
        }

      } else {
        result.err = "Record not found";
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  sharePost_Old: async function (body, currUser) {
    let result = {};
    let notificationObj = {
      postId: body._id,
      title: "shared your post",
      type: "share",
      createdBy: currUser._id,
      createdFor: body.createdBy,
    };
    delete body._id;
    delete body.commentCount;
    delete body.shareCount;
    delete body.likeCount;
    delete body.createdAt;
    delete body.updatedAt;
    try {
      body.createdBy = currUser._id;
      result.data = await new Post(body).save();
      await Post.findByIdAndUpdate(body.parentPostId, {
        $inc: { shareCount: 1 },
      });
      if (notificationObj.createdBy + "" !== notificationObj.createdFor + "") {
        await new Notifcation(notificationObj).save();
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  sharePost: async function (body, currUser) {
    let result = {};
    try {
      const currUserId = currUser._id;
      const postData = await Post.findOne({ _id: body.postId });
      if (postData) {
        let sharedPost = postData.toObject();
        sharedPost.createdBy = currUserId;
        sharedPost.parentPostId = body.postId;
        sharedPost.originalPostId = body.postId;
        delete sharedPost._id;
        delete sharedPost.commentCount;
        delete sharedPost.shareCount;
        delete sharedPost.likeCount;
        delete sharedPost.createdAt;
        delete sharedPost.updatedAt;

        const post = new Post(sharedPost);

        const savedPost = await post.save();

        await Post.findByIdAndUpdate(body.postId, {
          $inc: { shareCount: 1 },
        });

        let notificationObj = {
          postId: body.postId,
          title: "shared your post",
          type: "share",
          createdBy: currUserId,
          createdFor: postData.createdBy,
        };

        if (notificationObj.createdBy + "" !== notificationObj.createdFor + "") {
          await new Notifcation(notificationObj).save();
        }

        result.data = savedPost;
        result.message = "Post shared successfully";

      } else {
        result.err = "Post not found or may have been removed";
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  sharePostList: async function (likeObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let createdBy = { path: "createdBy" };
    const { start, length } = likeObj;
    if (likeObj.filter !== undefined) {
      if (
        likeObj.filter.searchText !== undefined &&
        likeObj.filter.searchText !== null &&
        likeObj.filter.searchText !== ""
      ) {
        createdBy.match = {
          $or: [
            {
              user_name: {
                $regex: ".*" + likeObj.filter.searchText + ".*",
                $options: "i",
              },
            },
            {
              email: {
                $regex: ".*" + likeObj.filter.searchText + ".*",
                $options: "i",
              },
            },
          ],
        };
      }
      if (likeObj.filter.postId !== undefined && likeObj.filter.postId !== null && likeObj.filter.postId !== "") {
        condition["originalPostId"] = likeObj.filter.postId;
      }
    }
    try {
      if (start === undefined || length === undefined) {
        data = await Post.find(condition)
          .populate(createdBy)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.createdBy != null));
      } else {
        data = await Post.find(condition)
          .populate(createdBy)
          .limit(parseInt(length))
          .skip(start)
          .sort({
            _id: "desc",
          })
          .then((items) => items.filter((item) => item.createdBy != null));
      }

      count = await Post.countDocuments(condition);
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

  newPostList: async function (postObj, currUser) {
    let result = {};
    let condition = {};
    let count = 0;
    let data = null;

    return result;
  },

  myFeed: async function (postObj, currUser) {
    let result = {};
    let count = 0;
    let sortBy = {
      createdAt: -1
    };
    try {
      const loginUserId = currUser._id;
      //posts liked by logged in user
      let postsLikedByLoginUser = await PostLike.find({ createdBy: currUser._id }, { _id: 1, postId: 1, type: 1 });
      //logged in user liked posts id array
      let likeArr = postsLikedByLoginUser.map((i) => i.postId + "");

      //blocked users my login user
      const blockedUserList = await UserBlocked.find({ userId: currUser._id });
      const blockedUserArr = blockedUserList.map((blockedUser) => { blockedUser.blockedId + "" });
      //users followed by login uesr
      const usersIFollowList = await UserFollower.find({ userId: loginUserId }).select({ _id: 0, followingId: 1 });
      //remove the blocked users from followed users 
      //type string
      const userIFollowArr = usersIFollowList.map((userFollowed) => {
        const followedId = userFollowed.followingId + "";
        if (!blockedUserArr.includes(followedId)) {
          return followedId;
        }
      });

      //remove the blocked users from followed users
      //type objectId
      const usersFollowedByLoginUser = usersIFollowList.map((userFollowed) => {
        const followedId = userFollowed.followingId + "";
        if (!blockedUserArr.includes(followedId)) {
          return userFollowed.followingId;
        }
      });

      // all unique posts liked by users who Login user follows
      const postsLikedByUserIFollow = await Post.aggregate([
        {
          $lookup: {
            from: 'postlikes',
            localField: '_id',
            foreignField: 'postId',
            as: 'likes'
          }
        },
        {
          $match: {
            'likes.createdBy': { $in: usersFollowedByLoginUser }  // Filters out posts with no likes
          }
        },
        {
          $group: {
            _id: '$createdBy',
            posts: { $addToSet: '$_id' }  // Collects unique post IDs for each user
          }
        }
      ]);

      const postCreatedByOtherUsersArr = postsLikedByUserIFollow.map((likedPost) => likedPost._id);

      //shared post users
      let sharedPostUserList = await PostShare.find({ sharedTo: loginUserId }, { sharedBy: 1, _id: 0 });

      //remove the blcoked users
      const sharedPostUserArr = sharedPostUserList.map((i) => {
        if (!blockedUserArr.includes(i.sharedBy + "")) {
          return i.sharedBy;
        }
      });

      const userIdsArray = sharedPostUserArr.concat(postCreatedByOtherUsersArr);
      const mergerd = usersFollowedByLoginUser.concat(userIdsArray);
      const loginUserArray = [loginUserId];
      //contact all users together
      const allUsers = mergerd.concat(loginUserArray);

      let isActive = true;
      if (postObj.filter.is_active !== undefined && postObj.filter.is_active !== null && postObj.filter.is_active !== "") {
        isActive = postObj.filter.is_active;
      }

      //documents filter contidions
      const documentFilter = {
        $and: [
          {
            shareType: { $in: ['Public', 'Friends', 'Only Me', 'Selected'] }
          },
          {
            createdBy: { $in: allUsers },
          },
          {
            is_hidden: false,
          },
          {
            is_active: isActive
          }
        ],
      };

      //sortBy
      if (postObj.sortBy !== undefined && postObj.sortBy.createdAt !== "") {
        if (postObj.sortBy.createdAt === "desc") {
          sortBy = { createdAt: -1 };
        } else {
          sortBy = { createdAt: 1 };
        }
      }

      //count total number posts with filters
      count = await Post.countDocuments(documentFilter);

      //get all posts with filters sort limit and offset
      const data = await Post.find(documentFilter)
        .populate("createdBy")
        .populate({
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
              full_name: 1,
              role: 1
            }
          }
        })
        .limit(parseInt(postObj.length))
        .skip(postObj.start)
        .sort({ createdAt: -1 });

      let postIdArray = data.map((i) => i._id);

      //login user reactions on the post
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

      let hiddenPostList = await UserPostHidden.find({ userId: loginUserId });

      let hiddenPostIdsArr = hiddenPostList.map((i) => i.postId + "");

      for (let post of data) {
        post._doc.isHidden = false;
        post._doc.isLiked = false;
        if (hiddenPostIdsArr.includes(post._id + "")) {
          post._doc.isHidden = true;
        }

        if (likeArr.includes(post._id + "")) {
          post._doc.isLiked = true;
          var filteredReaction = postsLikedByLoginUser.filter(postLike => postLike.postId + "" === post._id + "");
          post._doc.reaction = filteredReaction.length > 0 ? filteredReaction[0] : {};
        }

        if (reactions.length > 0) {
          const reaction = reactions.filter(reaction => reaction.postId.toString() === post._id.toString());
          if (reaction.length > 0) {
            post._doc.postReactions = reaction[0].reactions;
          } else {
            post._doc.postReactions = [];
          }
        }
      }

      result = {
        //filter: documentFilter,
        // usersFollowedByLoginUser,
        // postCreatedByOtherUsersArr,
        // sharedPostUserArr,
        // userIdsArray,
        // loginUserArray,
        // allUsers,
        count: count,
        records: data.length,
        data: data
      };
    } catch (error) {
      result.err = error.message;
    }
    return result;
  }
};

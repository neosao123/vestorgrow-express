const User = require("../models/User.model");
const LearningMaterial = require("../models/LearningMaterial.model");
const Lesson = require("../models/Lesson.model");
const Webinar = require("../models/Webinar.model");
const Post = require("../models/Post.model");
const Message = require("../models/Message.model");
const { PostSendFailed } = require("sib-api-v3-sdk");

async function listUser(userObj, currUser) {
  let result = "";
  let condition = {};

  const { start, length } = userObj;

  delete userObj.start;
  delete userObj.length;

  if (userObj.searchText !== undefined) {
    condition = {
      $or: [
        // {
        //   first_name: {
        //     $regex: ".*" + userObj.searchText + ".*",
        //     $options: "i",
        //   },
        // },
        // {
        //   last_name: {
        //     $regex: ".*" + userObj.searchText + ".*",
        //     $options: "i",
        //   },
        // },
        {
          user_name: {
            $regex: "^" + userObj.searchText + ".*",
            $options: "i",
          },
        },
        // {
        //   email: {
        //     $regex: ".*" + userObj.searchText + ".*",
        //     $options: "i",
        //   },
        // },
      ],
    };
  }

  condition["is_active"] = true;

  try {
    if (start === undefined || length === undefined) {
      result = await User.find(condition)
        .select({ _id: 1, user_name: 1, first_name: 1, last_name: 1, profile_img: 1, title: 1, role: 1 })
        .sort({
          createdAt: "desc",
        });
    } else {
      result = await User.find(condition)
        .select({ _id: 1, user_name: 1, first_name: 1, last_name: 1, profile_img: 1, title: 1, role: 1 })
        .limit(parseInt(length))
        .skip(start)
        .sort({
          createdAt: "desc",
        });
    }
    result = {
      data: result,
      total: await User.countDocuments(condition),
    };
  } catch (err) {
    result.err = err.message;
  }

  return result;
}

async function listLearningMaterial(userObj, currUser) {
  let result = "";
  let condition = {};

  const { start, length } = userObj;

  delete userObj.start;
  delete userObj.length;

  if (userObj.searchText !== undefined) {
    condition = {
      $or: [
        {
          title: {
            $regex: ".*" + userObj.searchText + ".*",
            $options: "i",
          },
        },
        // {
        //     desc: {
        //         $regex: ".*" + userObj.searchText + ".*",
        //         $options: "i",
        //     },
        // },
      ],
    };
  }

  condition["is_active"] = true;

  try {
    if (start === undefined || length === undefined) {
      result = await LearningMaterial.find(condition).select({ _id: 1, title: 1 }).sort({
        createdAt: "desc",
      });
    } else {
      result = await LearningMaterial.find(condition)
        .select({ _id: 1, title: 1 })
        .limit(parseInt(length))
        .skip(start)
        .sort({
          createdAt: "desc",
        });
    }
    result = {
      data: result,
      total: await LearningMaterial.countDocuments(condition),
    };
  } catch (err) {
    result.err = err.message;
  }

  return result;
}

async function listLesson(userObj, currUser) {
  let result = "";
  let condition = {};

  const { start, length } = userObj;

  delete userObj.start;
  delete userObj.length;

  if (userObj.searchText !== undefined) {
    condition = {
      $or: [
        {
          course_name: {
            $regex: ".*" + userObj.searchText + ".*",
            $options: "i",
          },
        },
        // {
        //     desc: {
        //         $regex: ".*" + userObj.searchText + ".*",
        //         $options: "i",
        //     },
        // },
      ],
    };
  }

  condition["is_active"] = true;

  try {
    if (start === undefined || length === undefined) {
      result = await Lesson.find(condition).select({ _id: 1, course_name: 1 }).sort({
        createdAt: "desc",
      });
    } else {
      result = await Lesson.find(condition)
        .select({ _id: 1, course_name: 1 })
        .limit(parseInt(length))
        .skip(start)
        .sort({
          createdAt: "desc",
        });
    }
    result = {
      data: result,
      total: await Lesson.countDocuments(condition),
    };
  } catch (err) {
    result.err = err.message;
  }

  return result;
}

async function listWebinar(userObj, currUser) {
  let result = "";
  let condition = {};

  const { start, length } = userObj;

  delete userObj.start;
  delete userObj.length;

  if (userObj.searchText !== undefined) {
    condition = {
      $or: [
        {
          title: {
            $regex: ".*" + userObj.searchText + ".*",
            $options: "i",
          },
        },
        // {
        //     desc: {
        //         $regex: ".*" + userObj.searchText + ".*",
        //         $options: "i",
        //     },
        // },
      ],
    };
  }

  condition["is_active"] = true;

  try {
    if (start === undefined || length === undefined) {
      result = await Webinar.find(condition).select({ _id: 1, title: 1 }).sort({
        createdAt: "desc",
      });
    } else {
      result = await Webinar.find(condition).select({ _id: 1, title: 1 }).limit(parseInt(length)).skip(start).sort({
        createdAt: "desc",
      });
    }
    result = {
      data: result,
      total: await Webinar.countDocuments(condition),
    };
  } catch (err) {
    result.err = err.message;
  }

  return result;
}

async function listPost(userObj, currUser) {
  let result = "";
  let condition = {};

  const { start, length } = userObj;

  delete userObj.start;
  delete userObj.length;

  if (userObj.searchText !== undefined) {
    condition = {
      $or: [
        {
          message: {
            $regex: ".*" + userObj.searchText + ".*",
            $options: "i",
          },
        },
        // {
        //     desc: {
        //         $regex: ".*" + userObj.searchText + ".*",
        //         $options: "i",
        //     },
        // },
      ],
    };
  }

  condition["is_active"] = true;

  try {
    if (start === undefined || length === undefined) {
      result = await Post.find(condition).select({ _id: 1, message: 1 }).sort({
        createdAt: "desc",
      });
    } else {
      result = await Post.find(condition).select({ _id: 1, message: 1 }).limit(parseInt(length)).skip(start).sort({
        createdAt: "desc",
      });
    }
    result = {
      data: result,
      total: await Post.countDocuments(condition),
    };
  } catch (err) {
    result.err = err.message;
  }

  return result;
}

async function listMessage(userObj, currUser) {
  let result = "";
  let condition = {};

  const { start, length } = userObj;

  delete userObj.start;
  delete userObj.length;

  if (userObj.searchText !== undefined) {
    condition = {
      content: {
        $regex: ".*" + userObj.searchText + ".*",
        $options: "i",
      },

      readBy: { $in: [currUser._id] },
    };
  }

  try {
    if (start === undefined || length === undefined) {
      result = await Message.find(condition)
        .select({ _id: 1, content: 1, chat: 1 })
        .populate("sender", { user_name: 1, profile_img: 1 })
        // .populate("chat", { _id })
        .sort({
          createdAt: "desc",
        });
    } else {
      result = await Message.find(condition)
        .select({ _id: 1, content: 1, chat: 1 })
        .populate("sender", { user_name: 1, profile_img: 1 })
        .limit(parseInt(length))
        .skip(start)
        .sort({
          createdAt: "desc",
        });
    }
    result = {
      data: result,
      total: await Post.countDocuments(condition),
    };
  } catch (err) {
    result.err = err.message;
  }

  return result;
}

async function listLimitedSearchedUsers(userObj, currUser) {

}

module.exports = {
  getSearchData: async function (searchObj, currUser) {
    let megaResult = {};
    megaResult["user"] = await listUser({ ...searchObj }, currUser);
    megaResult["learningMaterial"] = await listLearningMaterial({ ...searchObj }, currUser);
    megaResult["lesson"] = await listLesson({ ...searchObj }, currUser);
    megaResult["webinar"] = await listWebinar({ ...searchObj }, currUser);
    megaResult["post"] = await listPost({ ...searchObj }, currUser);
    megaResult["message"] = await listMessage({ ...searchObj }, currUser);
    return megaResult;
  },

  getMentionedUsers: async function (searchObj, currUser) {
    let result = "";
    let condition = {};

    const { start, length } = searchObj;

    delete searchObj.start;
    delete searchObj.length;

    if (searchObj.searchText !== undefined) {
      condition = {
        $or: [
          {
            user_name: {
              $regex: "^" + searchObj.searchText + ".*",
              $options: "i",
            },
          }
        ],
      };
    }

    condition["is_active"] = true;

    try {
      result = await User.find(condition)
        .select({ _id: 1, user_name: 1, first_name: 1, last_name: 1, profile_img: 1, title: 1, role: 1 })
        .limit(15)
        .skip(0)
        .sort({
          createdAt: "desc",
        });
      result = {
        data: result,
        total: await User.countDocuments(condition),
      };
    } catch (err) {
      result.err = err.message;
    }

    return result;
  }
};

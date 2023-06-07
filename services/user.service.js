const User = require("../models/User.model");
const UserOtp = require("../models/UserOtp.model");
const UserLogin = require("../models/UserLogin.model");
const Post = require("../models/Post.model");
const CommentLike = require("../models/CommentLike.model");
const CommentReply = require("../models/CommentReply.model");
const PostComment = require("../models/PostComment.model");
const PostLike = require("../models/PostLike.model");
const PostShare = require("../models/PostShare.model");
const ReplyLike = require("../models/ReplyLike.model");
const UserFollower = require("../models/UserFollower.model");
const UserFollowerTemp = require("../models/UserFollowerTemp.model");
const Chat = require("../models/Chat.model");
const Message = require("../models/Message.model");
const Notifcation = require("../models/Notification.model");
const GlobalMessage = require("../models/GlobalMessage.model");
const getSearchData = require("./getSearchData");
const bcrypt = require("bcrypt");
const utils = require("../utils/utils");
const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const moment = require("moment");
const { mongo } = require("mongoose");
module.exports = {
  add: async function (user, currUser) {
    let result = {};
    const saltRounds = 10;
    let randompwd = "";
    try {
      if (user.password) {
        randompwd = user.password;
      }
      let CheckEmail = await User.find({ email: user.email });
      let checkUserName = await User.find({ user_name: user.user_name });
      if (checkUserName.length === 0) {
        if (CheckEmail.length === 0) {
          let salt = bcrypt.genSaltSync(saltRounds);

          let hash = bcrypt.hashSync(randompwd, salt);
          user.password = hash;
          user.setting = {};
          result.data = await new User(user).save();
          result.data = await User.findOne({ _id: ObjectId(result.data._id) });
          this.signupActiveLink(user.email);
          // result.token = utils.jwtEncode({ email: result.data.email, userId: result.data._id })
          // result.token = await jwt.sign(
          //     { email: result.data.email, userId: result.data._id },
          //     process.env.JWT_KEY
          // );
        } else {
          throw Error("This email is already registered.");
        }
      } else {
        throw Error("This user name is already registered.");
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  edit: async function (body, currUser) {
    let result = { data: null };
    const { password, verifyPassword, newPassword, email, _id, user_name } = body;
    const saltRounds = 10;
    let randompwd = "";

    try {
      const usr = await User.findById(_id).select("+password");
      if (email !== usr.email) {
        const checkEmail = await User.findOne({ email: email });
        //checking both users email from database to body email
        if (checkEmail) {
          throw Error("Email already registered");
        }
      }
      if (user_name !== usr.user_name) {
        const checkUserName = await User.findOne({ user_name: user_name });
        if (checkUserName) {
          throw Error("User name already registered");
        }
      }

      //compare the old password with new password if body contain password
      if (password && verifyPassword && newPassword) {
        //checking  new password and old password
        if (newPassword !== verifyPassword) {
          throw Error("Password does't match.");
        }
        const check = await bcrypt.compare(password, usr.password);
        if (!check) {
          throw Error("Old password does't match.");
        }

        //check the current user id is equal to body user id
        // if (currUser._id.toString() != _id) {
        //   return { error: "Permission Denied." };
        // }

        let salt = bcrypt.genSaltSync(saltRounds); // creating salt
        let hash = bcrypt.hashSync(newPassword, salt); // create hash
        body.password = hash; // setting hash password to the original password

        //saving the new data
        result.data = await User.findByIdAndUpdate(body._id, { $set: body }, { new: true });
      } else {
        result.data = await User.findByIdAndUpdate(body._id, { $set: body }, { new: true });
      }
      return {
        result: result.data,
        message: "Updated Successfully",
      };
      // return { message: "Updated Successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  addProfile: async function (body) {
    let result = { data: null };
    try {
      const usr = await User.findOne({ active_token: body.active_token });
      if (usr) {
        let activeToken = body.active_token;
        body.active_token = "";
        result.data = await User.findOneAndUpdate({ active_token: activeToken }, { $set: body }, { new: true });
        result.token = utils.jwtEncode({ email: usr.email, userId: usr._id });
        return {
          result: result.data,
          token: utils.jwtEncode({ email: usr.email, userId: usr._id }),
          message: "Updated Successfully",
        };
        // return { message: "Updated Successfully" };
      } else {
        throw Error("Token not found");
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  editSetting: async function (body, currUser) {
    let result = { data: null };
    try {
      const usr = await User.findById(body._id);
      if (usr) {
        result.data = await User.findByIdAndUpdate(body._id, { $set: body }, { new: true });
        return {
          result: result.data,
          message: "Updated Successfully",
        };
      } else {
        throw Error("User not found");
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  editFirstView: async function (body, currUser) {
    let result = { data: null };
    try {
      const usr = await User.findById(currUser._id);
      if (usr) {
        result.data = await User.findByIdAndUpdate(currUser._id, { $set: body }, { new: true });
        return {
          result: result.data,
          message: "Updated Successfully",
        };
      } else {
        throw Error("User not found");
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  updateOnlineStatus: async function (body, currUser) {
    let result = { data: null };
    try {
      result.data = await User.findByIdAndUpdate(currUser._id, { $set: { is_online: true } }, { new: true });
      return {
        result: result.data,
        message: "Updated Successfully",
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  getOnlineStatus: async function (body) {
    let result = { data: null };
    let newDate = moment().subtract(1, "m").format();
    try {
      result.data = await User.find({ _id: { $in: body.users }, updatedAt: { $gte: newDate } }, { _id: 1 }).then(
        (resp) => resp.map((i) => i._id)
      );
      return {
        result: result.data,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  getDetail: async function (id) {
    let result = {
      data: null,
      err: null,
    };
    try {
      if (id) {
        result.data = await User.findById(id);
      } else {
        throw Error("User not found");
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
      result.data = await User.findByIdAndDelete(id);
      if (result.data) {
        console.log(id);
        let following = await UserFollower.find({ userId: id }).then((resp) => resp.map((i) => i.followingId + ""));
        let follower = await UserFollower.find({ followingId: id }).then((resp) => resp.map((i) => i.userId + ""));
        await User.updateMany({ _id: { $in: following } }, { $inc: { followers: -1 } });
        await User.updateMany({ _id: { $in: follower } }, { $inc: { following: -1 } });
        await UserFollower.deleteMany({ $or: [{ userId: id }, { followingId: id }] });
        await UserFollowerTemp.deleteMany({ $or: [{ userId: id }, { followingId: id }] });
        let postData = await Post.find({ createdBy: id });
        let post = await Post.deleteMany({ createdBy: id });
        if (post && postData) {
          postData.forEach((item) => {
            toBeDeleted = [...toBeDeleted, ...item.mediaFiles];
          });
        }
        // await CommentLike.deleteMany({ createdBy: id });
        await CommentReply.deleteMany({ createdBy: id });
        await PostComment.deleteMany({ createdBy: id });
        // await PostLike.deleteMany({ createdBy: id });
        await PostShare.deleteMany({ sharedBy: id });
        // await ReplyLike.deleteMany({ sharedBy: id });
        // await Chat.deleteMany({ users: { $in: [id] }, isGroupChat: false });
        await Chat.updateMany({ users: { $in: [id] } }, { $pull: { users: id, groupAdmin: id } });
        // await GlobalMessage.deleteMany({ sender: id });
        await Notifcation.deleteMany({ $or: [{ createdBy: id }, { createdFor: id }] });
        // let messageData = await Message.find({ sender: id });
        // let message = await Message.deleteMany({ sender: id });
        // if (message && messageData) {
        //   messageData.forEach((item) => {
        //     toBeDeleted = [...toBeDeleted, ...item.file];
        //   });
        // }
        toBeDeleted.push(result.data.profile_img);
        toBeDeleted.push(result.data.cover_img);
        return { toBeDeleted, message: "Record deleted successfully" };
      } else {
        throw Error("Record not found");
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
  listAll: async function (userObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    let sortBy = { createdAt: "desc" };
    if (userObj.sort) {
      sortBy = userObj.sort;
    }
    if (userObj.filter !== undefined) {
      if (userObj.filter.searchText !== undefined) {
        condition = {
          $or: [
            {
              user_name: {
                $regex: ".*" + userObj.filter.searchText + ".*",
                $options: "i",
              },
            },
            {
              email: {
                $regex: ".*" + userObj.filter.searchText + ".*",
                $options: "i",
              },
            },
          ],
        };
      }
      if (userObj.filter.role !== undefined && userObj.filter.role !== null && userObj.filter.role != "") {
        condition["role"] = userObj.filter.role;
      }

      if (userObj.filter.searchId !== undefined && userObj.filter.searchId !== null && userObj.filter.searchId != "") {
        condition["_id"] = userObj.filter.searchId;
      }
    }

    try {
      if (userObj.start === undefined || userObj.length === undefined) {
        data = await User.find(condition).sort(sortBy);
      } else {
        data = await User.find(condition).limit(parseInt(userObj.length)).skip(userObj.start).sort(sortBy);
      }
      count = await User.countDocuments(condition);
      result = {
        data: data,
        total: count,
        currPage: parseInt(userObj.start / userObj.length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }

    return result;
  },
  login: async function (email, password, logintype, body, reqMeta) {
    let result = {};
    try {
      let user = await User.findOne({ $or: [{ email: email }, { user_name: email }] }).select("+password");

      if (user && user.is_active === false) {
        throw Error("Account is inactive.");
      } else {
        let check = false;
        if (user) {
          check = await bcrypt.compare(password, user.password);
          user.password = undefined;
        }
        if (check === true) {
          if (user.setting?.email_verification) {
            let otp = Math.floor(100000 + Math.random() * 900000);
            // Mail for forgot password
            let newSub = "Vestorgrow login otp";

            let newContent = "Please send this otp " + otp + " to login ";

            let params = {
              to: user.email,
              subject: newSub,
              text: newContent,
            };
            utils.emailSend(params);
            let email_otp = { otp: otp, email: user.email };
            data = await new UserOtp(email_otp).save();
            result.data = user;
            result.message = "OTP sent to your registered email";
          } else {
            result.data = user;
            result.token = utils.jwtEncode({ email: user.email, userId: user._id, deviceId: body.deviceId });
            reqMeta.user_id = user._id;
            reqMeta.device_id = body.device_id;
            reqMeta.auth_token = result.token;
            let session = await UserLogin.findOne({ device_id: body.device_id, user_id: user._id });
            if (session) {
              session.updatedAt = new Date();
              session.isLogin = true;
              await session.save();
            } else {
              await new UserLogin(reqMeta).save();
            }

            await User.findByIdAndUpdate({ _id: user._id }, { loginAt: new Date() });
          }
        } else {
          throw Error("Email or password is incorrect.");
        }
      }
    } catch (err) {
      return (result.err = err.message);
    }
    return result;
  },
  otpLogin: async function (email, password, otp, logintype, body, reqMeta) {
    let result = {};
    let newDate = moment().subtract(2, "m").format();

    try {
      let user = await User.findOne({ $or: [{ email: email }, { user_name: email }] }).select("+password");

      if (user && user.is_active === false) {
        throw Error("Account is inactive.");
      } else {
        let check = false;
        if (user) {
          check = await bcrypt.compare(password, user.password);
          user.password = undefined;
        }
        let verifyOtp = await UserOtp.find({
          email: email,
          createdAt: { $gte: newDate },
        })
          .sort({ _id: -1 })
          .limit(1);
        if (verifyOtp.length > 0 && verifyOtp[0].otp == otp) {
          if (check === true) {
            result.data = user;
            result.token = utils.jwtEncode({ email: user.email, userId: user._id, deviceId: body.deviceId });
            reqMeta.user_id = user._id;
            reqMeta.device_id = body.device_id;
            reqMeta.auth_token = result.token;
            let session = await UserLogin.findOne({ device_id: body.device_id, user_id: user._id });
            if (session) {
              session.updatedAt = new Date();
              session.isLogin = true;
              await session.save();
            } else {
              await new UserLogin(reqMeta).save();
            }

            await User.findByIdAndUpdate({ _id: user._id }, { loginAt: new Date() });
            await UserOtp.deleteMany({ email: email });
          } else {
            throw Error("Email or password is incorrect.");
          }
        } else {
          throw Error("OTP is incorrect.");
        }
      }
    } catch (err) {
      return (result.err = err.message);
    }
    return result;
  },
  logout: async function (body) {
    let result = {};
    try {
      let session = await UserLogin.findOne({ device_id: body.device_id, user_id: body._id });
      if (session) {
        session.updatedAt = new Date();
        session.isLogin = false;
        await session.save();
        await User.findByIdAndUpdate(body._id, { $set: { is_online: false } });
      } else {
        throw Error("Email Id does not exists");
      }
    } catch (err) {
      return (result.err = err.message);
    }
    return result;
  },
  forgetPassword: async function (email) {
    let validation = true;
    let result = {};
    try {
      if (validation) {
        let data = await User.findOne({ $or: [{ email: email }, { user_name: email }] });

        if (data) {
          let otp = Math.floor(100000 + Math.random() * 900000);
          // Mail for forgot password
          let newSub = "Vestorgrow password help arrived";

          let newContent = "Please send this otp " + otp + " to reset password ";

          let params = {
            to: data.email,
            subject: newSub,
            text: newContent,
          };
          utils.emailSend(params);
          let email_otp = { otp: otp, email: data.email };
          data = await new UserOtp(email_otp).save();
          return {
            result: true,
            message: "Mail has been sent, please check your inbox or spam folder",
          };
        } else {
          throw Error("Email Id does not exists");
        }
      }
    } catch (err) {
      result.err = err.message;
      return result;
    }
  },
  resetPassword: async function (email, newPassword, verifyPassword, otp) {
    let validation = true;
    let result = {};
    let newDate = moment().subtract(2, "m").format();
    try {
      if (validation) {
        let data = await User.findOne({ $or: [{ email: email }, { user_name: email }] }); //,reset_password_expires:{$gt: Date}});

        if (data) {
          let verifyOtp = await UserOtp.find({
            email: data.email,
            createdAt: { $gte: newDate },
          })
            .sort({ _id: -1 })
            .limit(1);
          if (verifyOtp.length > 0 && verifyOtp[0].otp == otp) {
            if (newPassword === verifyPassword) {
              data.password = bcrypt.hashSync(newPassword, 10);
              data.reset_password_token = undefined;
              data.reset_password_expires = undefined;
              data.is_action_for_password = false;
              await data.save();
              await UserOtp.deleteMany({ email: data.email });

              let subject = "Password changed for your account";

              let newContent = "Your password is changed please login again with your new password";

              let params = {
                to: data.email,
                subject: `${subject}`,
                text: newContent,
              };
              utils.emailSend(params);
              return {
                result: true,
                message: "Password for your account has been reset, please login",
              };
            } else {
              throw Error("your password does't match");
            }
          } else {
            throw Error("your otp does't match");
          }
        } else {
          throw Error("Email Id does't exist");
        }
      }
    } catch (err) {
      result.err = err.message;
      return result;
    }
  },
  signupActiveLink: async function (emailId) {
    let validation = true;
    let result = {};
    try {
      let data = await User.findOne({ email: emailId }); //,reset_password_expires:{$gt: Date}});

      if (data) {
        token = crypto.randomBytes(20).toString("hex");

        data.active_token = token;

        await data.save();

        let mailName = data.user_name;

        // if (flag && flag === "admin_fogot_password") {
        //     url = process.env.ADMIN_BASE_URL + "/reset/" + token;
        // } else {
        // }
        // Mail for forgot password
        url = process.env.FRONTEND_BASE_URL + "/signup/active/" + token;
        let newSub = "Vestorgrow activation link";

        let newContent = "hello " + mailName + "<br/>Please go to this link to complete your registration :- " + url;

        let params = {
          to: data.email,
          subject: newSub,
          text: newContent,
        };
        utils.emailSend(params);
        return {
          result: true,
          message: "Mail has been sent, please check your inbox or spam folder",
        };
      } else if (result.data === null) {
        throw Error("Email Id does not exists");
      } else {
        throw Error("Validation failed");
      }
    } catch (err) {
      result.err = err.message;
      return result;
    }
  },
  sessionList: async function (userObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};

    if (userObj.filter !== undefined) {
      // if (userObj.filter.searchText !== undefined) {
      //     condition = {
      //         $or: [
      //             {
      //                 user_name: {
      //                     $regex: ".*" + userObj.filter.searchText + ".*",
      //                     $options: "i",
      //                 },
      //             },
      //             {
      //                 email: {
      //                     $regex: ".*" + userObj.filter.searchText + ".*",
      //                     $options: "i",
      //                 },
      //             },
      //         ],
      //     };
      // }

      if (userObj.filter.searchId !== undefined && userObj.filter.searchId !== null && userObj.filter.searchId != "") {
        condition["user_id"] = userObj.filter.searchId;
      }
    }

    try {
      if (userObj.start === undefined || userObj.length === undefined) {
        data = await UserLogin.find(condition).sort({
          updatedAt: "desc",
        });
      } else {
        data = await UserLogin.find(condition).limit(parseInt(userObj.length)).skip(userObj.start).sort({
          updatedAt: "desc",
        });
      }
      count = await User.countDocuments(condition);
      result = {
        data: data,
        total: count,
        currPage: parseInt(userObj.start / userObj.length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }

    return result;
  },
  getSearchData: async function (data, currUser) {
    let result = await getSearchData.getSearchData(data, currUser);
    return result;
  },

  getMentionUsers: async function (body, currUser) {
    let result = await getSearchData.getMentionedUsers(body, currUser);
    return result;
  },

  getMostFollowedUsers: async function (body) {
    let condition = {
      "_id": {
        $ne: body.id
      }
    };
    let sortBy = { followers: "desc" };
    try {
      data = await User.find(condition).limit(50).sort(sortBy);
      count = await User.countDocuments(condition);
      result = {
        data: data,
        total: count
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  }
};

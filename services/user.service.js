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
const UserSteps = require("../models/UserSteps.model");
const getSearchData = require("./getSearchData");
const bcrypt = require("bcrypt");
const utils = require("../utils/utils");
const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const moment = require("moment");
const { mongo } = require("mongoose");
const ejs = require("ejs");
const { link } = require("fs");
const { type } = require("os");

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
          await new UserSteps({ userId: result.data._id }).save()
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
          result.err = "Email already registered";
        }
      }
      if (user_name !== usr.user_name) {
        const checkUserName = await User.findOne({ user_name: user_name });
        if (checkUserName) {
          result.err = "User name already registered";
        }
      }

      if (body.first_name && body.first_name !== "") {
        body.full_name = body.first_name + " " + body.last_name;
      }



      //compare the old password with new password if body contain password
      if (password && verifyPassword && newPassword) {
        //checking  new password and old password
        if (newPassword !== verifyPassword) {
          result.err = "Password does't match.";
        }
        const check = await bcrypt.compare(password, usr.password);
        if (!check) {
          result.err = "Old password does't match.";
        }

        //check the current user id is equal to body user id
        // if (currUser._id.toString() != _id) {
        //   return { error: "Permission Denied." };
        // }

        let salt = bcrypt.genSaltSync(saltRounds); // creating salt
        let hash = bcrypt.hashSync(newPassword, salt); // create hash
        body.password = hash; // setting hash password to the original password

        //saving the new data
      }

      if (body.investmentInterests) {
        if ((typeof body.investmentInterests === "string") && body.investmentInterests === "") {
          console.log("chitfund")
          body.investmentInterests = [];
        } else if (body.investmentInterests.length === 0) {
          console.log("bosedk")
          body.investmentInterests = [];
        }
      } else {
        body.investmentInterests = [];
      }

      result.data = await User.findByIdAndUpdate(body._id, { $set: body }, { new: true });

      return {
        result: result.data,
        message: "Updated Successfully",
      };

    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  updateProfilePicture: async function (body, currUser) {
    let result = {
      data: null
    }
    try {
      result.data = await User.findByIdAndUpdate(body._id, { $set: body }, { new: true })
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  updateCoverPicture: async function (body, currUser) {
    let result = {
      data: null
    }
    try {
      result.data = await User.findByIdAndUpdate(body._id, { $set: body }, { new: true })
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
        // body.active_token = "";
        result.data = await User.findOneAndUpdate({ active_token: activeToken }, { $set: body }, { new: true });
        await UserSteps.findOneAndUpdate({ userId: usr._id }, { ProfileUpdates: true }, { new: true })
        result.token = utils.jwtEncode({ email: usr.email, userId: usr._id });
        return {
          result: result.data,
          token: utils.jwtEncode({ email: usr.email, userId: usr._id }),
          message: "Updated Successfully",
        };
        // return { message: "Updated Successfully" };
      } else {
        result.err = "Token not found";
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
        result.err = "User not found";
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
        result.err = "User not found";
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
        const res = await UserSteps.findOne({ userId: id })
        if (res) {
          result.data._doc.ProfileUpdates = res.ProfileUpdates;
          result.data._doc.UserSuggestions = res.UserSuggestions;
          result.data._doc.groupSuggestion = res.groupSuggestion;
        }
      } else {
        result.err = "User not found";
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
        result.err = "Record not found";
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
        result.err = "Account is inactive.";
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

            let email_otp = { otp: otp, email: user.email };
            data = await new UserOtp(email_otp).save();

            let mailData = {
              otp: otp,
              username: user.user_name
            };

            ejs.renderFile("./views/otpverification.ejs", mailData, (err, htmlData) => {
              if (err) {
                return result = {
                  result: false,
                  message: err.toString(),
                };
              }
              let subject = "Vestorgrow login otp";
              let newContent = htmlData;
              let params = {
                to: data.email,
                subject: `${subject}`,
                text: newContent,
              };
              result = utils.emailSend(params);
            });

            result.data = user;
            const res = await UserSteps.findOne({ userId: user._id })
            if (res) {
              result.data._doc.ProfileUpdates = res.ProfileUpdates;
              result.data._doc.UserSuggestions = res.UserSuggestions;
              result.data._doc.groupSuggestion = res.groupSuggestion;
            }
            result.message = "OTP sent to your registered email";
          } else {
            result.data = user;
            const res = await UserSteps.findOne({ userId: user._id })
            if (res) {
              result.data._doc.ProfileUpdates = res.ProfileUpdates;
              result.data._doc.UserSuggestions = res.UserSuggestions;
              result.data._doc.groupSuggestion = res.groupSuggestion;
            }
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
          result.err = "Email or password is incorrect.";
        }
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  otpLogin: async function (email, password, otp, logintype, body, reqMeta) {
    let result = {};
    let newDate = moment().subtract(2, "m").format();

    try {
      let user = await User.findOne({ $or: [{ email: email }, { user_name: email }] }).select("+password");

      if (user && user.is_active === false) {
        result.err = "Account is inactive.";
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
            result.err = "Email or password is incorrect.";
          }
        } else {
          result.err = "OTP is incorrect.";
        }
      }
    } catch (err) {
      result.err = err.message;
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
      }
      result.data = await User.findByIdAndUpdate(body._id, { $set: { is_online: false } });
    } catch (err) {
      result.err = err.message;
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

          let mailData = {
            otp: otp,
            username: data.user_name
          };

          let email_otp = { otp: otp, email: data.email };
          await new UserOtp(email_otp).save();

          ejs.renderFile("./views/otpverification.ejs", mailData, (err, htmlData) => {
            if (err) {
              return result = {
                result: false,
                message: err.toString(),
              };
            }
            let subject = "Vestorgrow password help arrived";
            let newContent = htmlData;
            let params = {
              to: data.email,
              subject: `${subject}`,
              text: newContent,
            };
            result = utils.emailSend(params);
          });

          if (result.result === true) {
            result.message = "Otp has been sent ot your mail, please chekc your inbox or spam folder";
          }

          return result;

        } else {
          result.err = "Email Id does not exists";
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
          }).sort({ _id: -1 }).limit(1);

          if (verifyOtp.length > 0 && verifyOtp[0].otp == otp) {
            if (newPassword === verifyPassword) {
              data.password = bcrypt.hashSync(newPassword, 10);
              data.reset_password_token = undefined;
              data.reset_password_expires = undefined;
              data.is_action_for_password = false;
              await data.save();
              await UserOtp.deleteMany({ email: data.email });

              var mailData = {
                username: data.user_name
              };

              ejs.renderFile("./views/resetpassoword.ejs", mailData, (err, htmlData) => {
                if (err) {
                  return result = {
                    result: false,
                    message: err.toString(),
                  };
                }
                let subject = "Password changed for your account";
                let newContent = htmlData;
                let params = {
                  to: data.email,
                  subject: `${subject}`,
                  text: newContent,
                };
                result = utils.emailSend(params);
              });

              if (result.result === true) {
                result.message = "Password for your account has been reset, please login";
              }
              return result;
            } else {
              result.err = "your password does't match";
            }
          } else {
            result.err = "your otp does't match";
          }
        } else {
          result.err = "Email Id does't exist";
        }
      }
    } catch (err) {
      result.err = err.message;
      return result;
    }
  },

  signinActivationLink: async function (emailId) {
    let validation = true;
    let result = {};
    try {
      let data = await User.findOne({ email: emailId }); //,reset_password_expires:{$gt: Date}});

      if (data) {
        token = crypto.randomBytes(20).toString("hex");

        data.active_token = token;

        await data.save();

        let mailName = data.user_name;

        // Mail for forgot password
        url = process.env.FRONTEND_BASE_URL + "/signin/active/" + token;

        const mailData = {
          username: mailName,
          link: url
        };
        ejs.renderFile("./views/activationlink.ejs", mailData, (err, htmlData) => {
          if (err) {
            return result = {
              result: false,
              message: err.toString(),
            };
          }
          let subject = "Vestorgrow activation link";
          let newContent = htmlData;
          let params = {
            to: data.email,
            subject: `${subject}`,
            text: newContent,
          };
          result = utils.emailSend(params);
        });

        if (result.result === true) {
          result.message = "Mail has been sent, please check your inbox or spam folder";
        }

        return result;
      } else if (result.data === null) {
        result.err = "Email Id does not exists";
      } else {
        result.err = "Validation failed";
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

        // Mail for forgot password
        url = process.env.FRONTEND_BASE_URL + "/signup/active/" + token;

        const mailData = {
          username: mailName,
          link: url
        };
        ejs.renderFile("./views/activationlink.ejs", mailData, (err, htmlData) => {
          if (err) {
            return result = {
              result: false,
              message: err.toString(),
            };
          }
          let subject = "Vestorgrow activation link";
          let newContent = htmlData;
          let params = {
            to: data.email,
            subject: `${subject}`,
            text: newContent,
          };
          result = utils.emailSend(params);
        });

        if (result.result === true) {
          result.message = "Mail has been sent, please check your inbox or spam folder";
        }

        return result;
      } else if (result.data === null) {
        result.err = "Email Id does not exists";
      } else {
        result.err = "Validation failed";
      }
    } catch (err) {
      result.err = err.message;
      return result;
    }
  },

  activateAccount: async function (body) {
    let result = {};
    try {
      const user = await User.findOne({ active_token: body.token });
      if (user) {
        result.data = await User.findByIdAndUpdate(user._id, { $set: { accountVerified: true } }, { new: true });
        result = {
          status: true,
          data: result.data,
          message: "Activated Successfully",
        };
      } else {
        result = {
          status: false,
          message: "Invalid Token. Please login again to continue...",
        };
      }
    } catch (err) {
      result.err = err.message;
    }
    return result;
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
  },

  addAccountVerified: async function (body) {
    let result = {};
    try {
      result.data = await User.updateMany({}, { $set: { accountVerified: true } }, { new: true });
      return { message: "Updated Successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  addInvestmentArray: async function (body) {
    let result = {};
    try {
      result.data = await User.updateMany({}, { $set: { investmentInterests: [] } }, { new: true });
      return { message: "Updated Successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  addWebsite: async function (body) {
    let result = {};
    try {
      result.data = await User.updateMany({}, { $set: { websiteUrl: "" } }, { new: true });
      return { message: "Updated Successfully" };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  getUserPreviewData: async function (userId, currUser) {
    let result = {};
    try {
      let links = [];
      result.user = await User.findOne({ _id: userId }).select({ first_name: 1, last_name: 1, user_name: 1, profile_img: 1, followers: 1, following: 1 });
      const postCounts = await Post.countDocuments({ createdBy: userId });
      const posts = await Post.find({ createdBy: userId, shareType: "Public", mediaFiles: { $ne: [] } }).sort({ createdAt: -1 }).limit(3);
      if (posts.length > 0) {
        for (let post of posts) {
          const mediaFiles = post.mediaFiles;
          if (mediaFiles.length > 0) {
            links.push(mediaFiles[0]);
          }
        }
      }
      result.followingStatus = "notfollowing";
      let following = await UserFollower.findOne({ userId: currUser._id, followingId: userId });
      if (following) {
        result.followingStatus = "following";
      } else {
        let requested = await UserFollowerTemp.findOne({ userId: currUser._id, followingId: userId });
        if (requested) {
          result.followingStatus = "requested";
        }
      }

      result.postsMediaFiles = links;
      result.postsCount = postCounts;
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  updateAbout: async function (body) {
    let result = { data: null };
    const { _id, websiteUrl, investmentInterests, bio, gender } = body;
    try {
      const userData = {
        websiteUrl: websiteUrl,
        gender: gender,
        bio: bio,
        investmentInterests: investmentInterests
      }
      result.data = await User.findByIdAndUpdate(_id, { $set: userData }, { new: true });
      result.message = "Updated Successfully";
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  suggestedUsers: async function (payload, currUser) {
    let result = {};
    try {
      let { page } = payload;

      const pageNumber = page !== undefined ? parseInt(page) : 1;
      const pageSize = 10;

      let sortBy = { followers: "desc" };

      let userIdArray = [];
      userIdArray.push(currUser._id);

      const following = await UserFollower.find({ userId: currUser._id }).select({ followingId: 1 });

      let followingArr = following.map((i) => {
        return i.followingId + "";
      });

      if (following.length > 0) {
        for (let usr of following) {
          userIdArray.push(usr.followingId);
        }
      }

      let followingRequested = await UserFollowerTemp.find({ userId: currUser._id }).select({ _id: 0, followingId: 1 });

      let requestedArr = followingRequested.map((i) => {
        return i.followingId + "";
      });

      if (followingRequested.length > 0) {
        for (let usr of followingRequested) {
          userIdArray.push(usr.followingId);
        }
      }

      const users = await User.find({ _id: { $nin: userIdArray } }).skip((pageNumber - 1) * pageSize).limit(pageSize).sort(sortBy);

      if (users.length > 0) {
        for (let user of users) {
          if (followingArr.includes(user._id + "")) {
            user._doc.isFollowing = "following";
          } else if (requestedArr.includes(user._id + "")) {
            user._doc.isFollowing = "requested";
          } else {
            user._doc.isFollowing = "notfollowing";
          }
        }
      }

      count = await User.countDocuments({ _id: { $nin: userIdArray } });

      const followingUsers = await UserFollower.find({ userId: currUser._id }).populate("followingId");

      const totalPages = Math.ceil(count / pageSize);

      result = {
        //userId: currUser._id,
        //followingAlready: followingUsers,
        data: users,
        total: count,
        totalPages: totalPages
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  suggestionsByTab: async function (payload, currUser) {
    const { searchText, tab } = payload;
    const userId = currUser._id;
    let result = {};


    let following = await UserFollower.find({ userId: userId }).select({ followingId: 1 });

    let followingArr = following.map((i) => {
      return i.followingId + "";
    });

    let followingRequested = await UserFollowerTemp.find({ userId: currUser._id }).select({ _id: 0, followingId: 1 });

    let requestedArr = followingRequested.map((fUser) => {
      if (!followingArr.includes(fUser.followingId + "")) {
        return fUser.followingId + "";
      }
    });
    if (tab !== undefined) {
      let condition = {
        "_id": {
          $ne: currUser._id
        }
      };

      if (tab === "trending_people") {
        if (searchText !== undefined && searchText !== "") {
          condition = {
            $and: [
              { user_name: { $regex: "^" + searchText + ".*", $options: 'i' } },
              { followers: { $gt: 0 } },
              {
                _id: { $ne: userId }
              }
            ]
          };
        } else {
          condition = {
            followers: { $gt: 0 },
            _id: { $ne: userId }
          };
        }
        const users = await User.find(condition).sort({ followers: -1 }).limit(60);

        if (users.length > 0) {
          for (let user of users) {
            const uId = user._id + "";
            if (followingArr.includes(uId)) {
              user._doc.isFollowing = "following";
            } else if (requestedArr.includes(uId)) {
              user._doc.isFollowing = "requested";
            } else {
              user._doc.isFollowing = "notfollowing";
            }
          }

        }

        let Users = [];
        if (users.length > 0) {
          Users = users.filter((el) => {
            if (el._doc.isFollowing === "notfollowing") {
              return el;
            }
          })
        }



        result = {
          searchText: searchText,
          tab: tab,
          users: Users
        };
      } else if (tab === "you_may_know") {
        // friends of friends
        const searchKeyword = searchText || '';
        const pipeline = [
          {
            $lookup: {
              from: 'userfollowers',
              localField: '_id',
              foreignField: 'followingId',
              as: 'userfollowers'
            }
          },
          {
            $match: {
              'userfollowers.userId': { $nin: [userId] }, // Filter users not followed by you 
              _id: { $ne: userId }
            }
          },
          {
            $limit: 50
          },
          {
            $sort: {
              followers: -1
            }
          },
          {
            $addFields: {
              isFollowing: "notfollowing"
            }
          }
        ];

        if (searchKeyword) {
          pipeline.splice(2, 0, {
            $match: {
              user_name: { $regex: "^" + searchKeyword + ".*", $options: 'i' } // Filter users by name using regex
            }
          });
        }

        let users = await User.aggregate(pipeline);

        if (users.length > 0) {
          for (let user of users) {
            delete user.userfollowers;
            const uId = user._id + "";
            if (followingArr.includes(uId)) {
              user.isFollowing = "following";
            } else if (requestedArr.includes(uId)) {
              user.isFollowing = "requested";
            }
          }
        }

        let Users = [];
        if (users.length > 0) {
          Users = users.filter((el) => {
            if (el.isFollowing !== "following" && el.isFollowing !== "requested") {
              return el;
            }
          })
        }

        result = {
          searchText: searchText,
          tab: tab,
          users: Users
        };
      } else {
        //newly joined users
        if (searchText !== undefined && searchText !== "") {
          condition = {
            $and: [
              { user_name: { $regex: "^" + searchText + ".*", $options: 'i' } },
              { _id: { $ne: userId } }
            ]
          };
        } else {
          condition = {
            _id: { $ne: userId }
          }
        }

        const users = await User.find(condition).sort({ createdAt: -1 }).limit(50);

        if (users.length > 0) {
          for (let user of users) {
            if (followingArr.includes(user._id + "")) {
              user._doc.isFollowing = "following";
            } else if (requestedArr.includes(user._id + "")) {
              user._doc.isFollowing = "requested";
            } else {
              user._doc.isFollowing = "notfollowing";
            }
          }
        }


        let Users = [];
        if (users.length > 0) {
          Users = users.filter((el) => {
            if (el._doc.isFollowing === "notfollowing") {
              return el;
            }
          })
        }

        result = {
          searchText: searchText,
          tab: tab,
          users: Users
        };
      }
    } else {
      result.err = "Tabs is not provided";
    }
    return result;
  },

  addFullNamesToExistingUsers: async function () {
    let result = {};
    try {
      const users = await User.find({}).select({ _id: 1, first_name: 1, last_name: 1 });
      if (users) {
        for (let user of users) {
          const update = {
            $set: {
              full_name: user.first_name + " " + user.last_name
            }
          }
          await User.findByIdAndUpdate(user._id, update);
        }
        result.message = "Data found";
        result.data = await User.find({});
      }
    } catch (error) {
      result.err = error.message;
    }
    return result;
  }
};

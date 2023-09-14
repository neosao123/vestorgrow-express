const MobileUser = require("../models/User.model");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');
const moment = require("moment");
const { link } = require("fs");
const utils = require("../utils/utils");
const { log, Console } = require("console");
const AvatarImages = require("../models/avatarImages.modal");
const UserOtp = require("../models/UserOtp.model");
const UserLogin = require("../models/UserLogin.model");
const OtpVerificationType = {
  MOBILE: 'mobile',
  EMAIL: 'email'
}

module.exports = {
  /*
    - use this function to insert and send OTP to user's mobile or email address
    - user -> Any additional data to be updated with OTP
    - CheckEmail -> Array of user containing the user id (_id) in first position object
    - type OtpVerificationType enum with value
        - MOBILE for mobile update and sending SMS (Update Key - mobileOTP)
        - EMAIL for email update and sending email (Update Key - emailOTP)
  */
  insertOtp: async function (user, CheckEmail, type = OtpVerificationType.EMAIL) {
    let otp = Math.floor(100000 + Math.random() * 900000);
    var id = "";
    var status = false;

    if (type == OtpVerificationType.EMAIL) {
      user.emailOTP = otp;
    } else {
      user.mobileOTP = otp;
    }

    if (CheckEmail.length) {
      id = CheckEmail[0].id;
      updateUser = await MobileUser.findByIdAndUpdate(
        ObjectId(id),
        user,
        { new: true }
      );
    } else {
      updateUser = await MobileUser.create(user);
      if (updateUser) {
        id = updateUser._id;
      }
    }
    if (updateUser) {
      status = true;
    }
    return {
      id: id,
      otp: otp,
      status: status
    };
  },

  add: async function (user) {
    let result = {};
    var updateUser = user;

    let isSocialLogin = false
    const { full_name, email, date_of_birth, device_id, mobile_no } = user;
    delete user.device_id;
    isSocialLogin = (user.isSocialLogin === "true")
    try {
      if (!full_name || !email || !date_of_birth || !mobile_no) {
        throw Error("All fields required");
      }
      let CheckEmail = await MobileUser.find({ email }).select("+password");
      if (CheckEmail.length === 0 || (CheckEmail[0].accountVerified && (CheckEmail[0].password == null || CheckEmail[0].password == "")) || !CheckEmail[0].accountVerified) {
        if (isSocialLogin) {
          user.accountVerified = true;
        }
        let insertOtp = await this.insertOtp(user, CheckEmail);
        if (!insertOtp.status) {
          throw Error("Failed");
        }
        result.status = 200;
        if (isSocialLogin) {
          const finalData = JSON.parse(JSON.stringify(updateUser));
          delete finalData.emailOTP;
          delete finalData.mobileOTP;
          delete finalData.password;
          result.userdata = finalData;
        } else {
          result.otp = insertOtp.otp;
        }
        result.token = utils.jwtEncode({
          email,
          userId: insertOtp.id,
          deviceId: device_id,
        });
        result.message = "Success";
      } else {
        throw Error("This email is already registered.");
      }
    } catch (err) {
      result.status = 400;
      result.message = err.message;
    }
    return result;
  },

  changeEmail: async function (currUser, email) {
    let result = {};
    try {
      if (!email) {
        throw Error("All fields required");
      }
      let CheckEmail = await MobileUser.find({
        email: email,
        accountVerified: true,
        password: { $ne: null }
      });
      if (CheckEmail.length === 0) {
        let insertOtp = await this.insertOtp({ email: email }, [currUser]);
        if (!insertOtp.status) {
          throw Error("Failed");
        }
        // send otp email:
        // let mailData = {
        //   otp: otp,
        //   username: user.full_name,
        // };

        // ejs.renderFile(
        //   "./views/otpverification.ejs",
        //   mailData,
        //   (err, htmlData) => {
        //     if (err) {
        //       return (result = {
        //         result: false,
        //         message: err.toString(),
        //       });
        //     }
        //     let subject = "Vestorgrow Register OTP";
        //     let newContent = htmlData;
        //     let params = {
        //       to: newUser.email,
        //       subject: `${subject}`,
        //       text: newContent,
        //     };
        //     result = utils.emailSend(params);
        //   }
        // );

        result.otp = insertOtp.otp;
        result.email = email;
      } else {
        throw Error("This email is already registered.");
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  verifyEmail: async function (currUser, otp, isTwoStepVerify, reqMeta) {
    let result = {};
    try {
      if (!otp) {
        throw Error("All fields required");
      }
      let user = await MobileUser.findById(currUser._id);

      if (user.emailOTP === Number(otp)) {
        const updateDataResp = await MobileUser.findByIdAndUpdate(
          currUser._id,
          { accountVerified: true, emailOTP: null },
          { new: true }
        );
        const finalData = JSON.parse(JSON.stringify(updateDataResp));
        delete finalData.emailOTP;
        delete finalData.mobileOTP;
        delete finalData.password;
        result.message = "Email verified successfully.";
        result.userdata = finalData;
      } else {
        throw Error("Invalid OTP");
      }

      if (isTwoStepVerify == 1) {
        result.message = "Login Successfully."
        reqMeta.user_id = user._id;
        let session = await UserLogin.findOne({ device_id: reqMeta.device_id, user_id: user._id });
        if (session) {
          session.updatedAt = new Date();
          session.isLogin = true;
          await session.save();
        } else {
          await new UserLogin(reqMeta).save();
        }
        await MobileUser.findByIdAndUpdate({ _id: user._id }, { loginAt: new Date() });
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  addPassword: async (currUser, data, token, reqMeta) => {
    let result = {};
    try {
      if (!data || !data.password) {
        throw Error("All fields required");
      }
      const updateRes = await MobileUser.findByIdAndUpdate(
        ObjectId(currUser._id),
        { password: data.password },
        { new: true }
      );
      const finalData = JSON.parse(JSON.stringify(updateRes));
      delete finalData.emailOTP;
      delete finalData.mobileOTP;
      delete finalData.password;
      result.message = "Password generated successfully.";
      result.userdata = finalData;
      if (data.type == "new") {
        reqMeta.user_id = currUser._id;
        reqMeta.device_id = currUser.device_id;
        reqMeta.auth_token = token;
        let session = await UserLogin.findOne({ device_id: currUser.device_id, user_id: currUser._id });
        if (session) {
          session.updatedAt = new Date();
          session.isLogin = true;
          await session.save();
        } else {
          await new UserLogin(reqMeta).save();
        }
        await MobileUser.findByIdAndUpdate({ _id: currUser._id }, { loginAt: new Date() });
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  update_username: async (currUser, user_name) => {
    let result = {};
    try {
      if (user_name) {
        const isUserNameExist = await MobileUser.findOne({
          user_name,
        });
        if (isUserNameExist) {
          const userNameSuggestionArr = [];
          while (userNameSuggestionArr.length < 3) {
            const suggestedUserName = utils.generateUsername(user_name);
            const userNameExist = await MobileUser.findOne({
              user_name: suggestedUserName,
            });
            if (!userNameExist) {
              userNameSuggestionArr.push(suggestedUserName);
            }
          }
          result.status = 202;
          result.message = "Username already exist!";
          result.userNameSuggestionArr = userNameSuggestionArr;
          return result;
        } else {
          result = await MobileUser.findByIdAndUpdate(
            ObjectId(currUser._id),
            { user_name },
            { new: true }
          );
          result.status = 200;
          result.message = "Success";
        }
      } else {
        throw Error("All fields required");
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  resendOtp: async function (currUser, sendOtpIn) {
    let result = {};
    try {

      if (!sendOtpIn) {
        throw Error("All fields required");
      }
      let user = {}
      let insertOtp = await this.insertOtp(user, [currUser], sendOtpIn == "mobile" ? OtpVerificationType.MOBILE : OtpVerificationType.EMAIL);

      if (insertOtp.status) {
        result.otp = insertOtp.otp;
        result.status = 200;
        result.message = "Success";
      } else {
        throw Error("Failed");
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  updateBio: async (currUser, bio) => {
    let result = {};
    try {
      if (!bio) {
        throw Error("All fields required");
      }
      const updateBioResp = await MobileUser.findByIdAndUpdate(
        ObjectId(currUser._id),
        { bio },
        { new: true }
      );
      if (updateBioResp) {
        result.status = 200;
        result.userdata = updateBioResp;
      } else {
        throw Error("Failed");
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  updateProfileImg: async (currUser, image) => {
    let result = {};
    try {
      const findUser = await MobileUser.findById(ObjectId(currUser._id));
      if (findUser) {
        if (findUser.profile_img) {
          fs.unlink(path.join(__dirname, `../${findUser.profile_img}`), (err) => {
            if (!err) {
              console.log("Old profile image deleted: ", findUser.profile_img);
            }
          });
        }
      } else {
        throw Error("User not found");
      }
      const updateResp = await MobileUser.findByIdAndUpdate(
        ObjectId(currUser._id),
        { profile_img: image },
        { new: true }
      );
      if (updateResp) {
        result.status = 200;
        result.message = "Uploaded Successfully"
        result.userdata = updateResp;
      } else {
        throw Error("Failed");
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }

    return result;
  },

  socialLogin: async function (body, reqMeta) {
    const { email, device_id } = body;

    let result = {};
    try {
      if (!email || !device_id) {
        throw Error("All fields required");
      }
      let CheckEmail = await MobileUser.find({ email });
      if (CheckEmail.length != 0 && CheckEmail[0].accountVerified && CheckEmail[0].is_active && !CheckEmail[0].is_delete) {
        if (CheckEmail[0].setting?.email_verification) {
          result.status = 201;
          result.message = "Otp Verification Required";
          let emailID = CheckEmail[0].email;
          result.token = utils.jwtEncode({
            emailID,
            userId: CheckEmail[0].id,
            deviceId: device_id,
          });
          CheckEmail[0].password = undefined

          let insertOtp = await this.insertOtp({}, CheckEmail);
          if (!insertOtp.status) {
            throw Error("Failed");
          }
          result.otp = insertOtp.otp;
          result.email = emailID;

        } else {
          result.status = 200;
          const finalData = JSON.parse(JSON.stringify(CheckEmail[0]));
          delete finalData.emailOTP;
          delete finalData.mobileOTP;
          delete finalData.password;
          result.userdata = finalData;
          result.token = utils.jwtEncode({
            email,
            userId: CheckEmail[0].id,
            deviceId: device_id,
          });
          result.message = "Success";

          reqMeta.user_id = CheckEmail[0]._id;
          reqMeta.device_id = body.device_id;
          reqMeta.auth_token = result.token;

          let session = await UserLogin.findOne({ device_id: body.device_id, user_id: CheckEmail[0]._id });
          if (session) {
            session.updatedAt = new Date();
            session.isLogin = true;
            await session.save();
          } else {
            await new UserLogin(reqMeta).save();
          }
          await MobileUser.findByIdAndUpdate({ _id: CheckEmail[0]._id }, { loginAt: new Date() });
        }
      } else {
        result.status = 202;
        result.message = "User does not exists!";
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  login: async function (body, reqMeta) {
    console.log("body::", body);
    const { email, password, device_id } = body;
    let result = {};
    try {
      if (!email || !device_id || !password) {
        throw Error("All fields required");
      }
      let user = await MobileUser.findOne({ $or: [{ email: email }, { user_name: email }] }).select("+password");
      if (user != null && user.length != 0 && user.accountVerified && user.is_active && !user.is_delete) {

        if (await bcrypt.compare(password, user.password)) {
          throw Error("invaild credentials!");
        }
        if (user.setting?.email_verification) {
          result.status = 202;
          result.message = "Otp Verification Required";
          let emailID = user.email;
          result.token = utils.jwtEncode({
            emailID,
            userId: user.id,
            deviceId: device_id,
          });
          user.password = undefined

          let insertOtp = await this.insertOtp({}, [user]);
          if (!insertOtp.status) {
            throw Error("Failed");
          }
          result.otp = insertOtp.otp;
          result.email = emailID;

        } else {
          result.status = 200;
          result.message = "Success";
          const finalData = JSON.parse(JSON.stringify(user));
          delete finalData.emailOTP;
          delete finalData.mobileOTP;
          delete finalData.password;
          result.userdata = finalData;
          result.token = utils.jwtEncode({
            email,
            userId: user.id,
            deviceId: device_id,
          });

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
          await MobileUser.findByIdAndUpdate({ _id: user._id }, { loginAt: new Date() });
        }
      } else {
        result.status = 400;
        result.message = "User does not exists!";
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }

    return result;
  },

  forgotPassword: async function (user) {
    const { email, device_id } = user;
    let result = {};
    try {
      if (!email || !device_id) {
        throw Error("All fields required");
      }
      let CheckEmail = await MobileUser.find({ email });
      if (CheckEmail.length != 0 && CheckEmail[0].accountVerified && CheckEmail[0].is_active && !CheckEmail[0].is_delete) {
        let insertOtp = await this.insertOtp(user, CheckEmail);
        if (!insertOtp.status) {
          throw Error("Failed");
        }
        result.status = 200;
        result.message = "Success";
        result.otp = insertOtp.otp;
        result.token = utils.jwtEncode({
          email,
          userId: insertOtp.id,
          deviceId: device_id,
        });
      } else {
        result.status = 400;
        result.message = "User does not exists!";
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
    }
    return result;
  },

  getUserSuggestion: async (currUser, body) => {
    const userNumberArray = JSON.parse(JSON.stringify(body.userPhoneList));
    var arrayData = [];
    let arrayLength = userNumberArray.length;
    console.log(currUser._id)
    for (let i = 0; i < arrayLength; i++) {
      const element = userNumberArray[i];
      let a = await MobileUser.aggregate([
        {
          $project: {
            mobile_no: { $concat: ["$countrtyCode", "$mobile_no"] },
            bio: 1,
            profile_img: 1,
            full_name: 1,
            user_name: 1, password: 1, accountVerified: 1, _id: 1
          }
        },
        {
          $match: {
            mobile_no: element,
            _id: { $nin: [currUser._id] },
            accountVerified: true,
            password: { $nin: [null] }
          },
        },


        {
          $limit: 10,
        }
      ]);
      if (a != null && a.length != 0) {
        arrayData.push(a[0])
      }
    }
    const syncContacts = []
    arrayData.map((a) => syncContacts.push({
      bio: a.bio,
      profile_img: a.profile_img,
      full_name: a.full_name,
      _id: a._id,
      user_name: a.user_name
    }))
    let follower = await MobileUser.aggregate(
      [
        {
          $project: {
            maxfollowers: { $max: "$followers" },
            bio: 1,
            profile_img: 1,
            full_name: 1,
            user_name: 1, password: 1, accountVerified: 1, _id: 1
          }
        },
        {
          $match: {
            accountVerified: true,
            _id: { $nin: [currUser._id] },
            password: { $nin: [null] }
          },
        },
        {
          $limit: 10,
        }
      ]
    )
    const popularUser = []
    follower.map((a) =>
      popularUser.push({
        bio: a.bio,
        profile_img: a.profile_img,
        full_name: a.full_name,
        _id: a._id,
        user_name: a.user_name
      }))
    let result = {};

    result.status = 200;
    result.message = "Success";
    result.syncContactsUser = syncContacts;
    result.popularUser = popularUser;
    return result;
  },

  getAvatarImages: async () => {
    const images = await AvatarImages.find();
    console.log("images==>", images);
    let result = {};
    result.status = 200;
    result.message = "Success";
    result.images = images
    return result;
  },
};

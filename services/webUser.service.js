const UserModel = require("../models/User.model");
const utils = require("../utils/utils");
const ejs = require("ejs");
const userSteps = require("../models/UserSteps.model");
const UserTempModel = require("../models/userTemp.model");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const OtpVerificationType = {
    MOBILE: 'mobile',
    EMAIL: 'email'
}

module.exports = {

    insertOtp: async function (user, CheckEmail, type = OtpVerificationType.EMAIL) {
        let otp = Math.floor(1000 + Math.random() * 9000);
        var id = "";
        var status = false;

        if (type == OtpVerificationType.EMAIL) {
            user.emailOTP = otp;
        } else {
            user.mobileOTP = otp;
        }

        if (CheckEmail.length) {
            id = CheckEmail[0].id;
            updateUser = await UserTempModel.findByIdAndUpdate(
                ObjectId(id),
                user,
                { new: true }
            );
        } else {
            updateUser = await UserTempModel.create(user);
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
            user: updateUser,
            status: status
        };
    },

    add: async function (user) {
        let result = {};
        const { full_name, email, date_of_birth } = user;
        try {
            if (!full_name || !email || !date_of_birth) {
                throw Error("All fields required.")
            }
            let CheckEmail = await UserModel.find({ email }).select("+password");
            if (CheckEmail.length === 0) {
                let insertOtp = await this.insertOtp(user, CheckEmail);
                if (!insertOtp.status) {
                    throw Error("Failed");
                }
                let mailData = {
                    full_name,
                    otp: insertOtp.otp
                }

                ejs.renderFile("./views/emailverification.ejs", mailData, async (err, htmlData) => {
                    if (err) {
                        throw Error("We are unable to send email now.")
                    }
                    let subject = "OTP Verification";
                    const newContent = htmlData;
                    let params = {
                        to: email,
                        subject: subject,
                        text: newContent
                    }
                    let res = await utils.emailSend(params);
                    console.log(res)
                })
                delete insertOtp.otp
                result.status = 200;
                result.user = insertOtp.user
                result.email = email;
                result.message = "Success";
            }
            else {
                throw Error("This email is already registered.")
            }

        } catch (error) {
            result.status = 400;
            result.message = error.message
        }
        return result;
    },


    emailVerification: async function (otp, email) {
        let saltRounds = 10;
        let result = {};
        try {
            const User = await UserTempModel.findOne({ email: email });
            if (+otp === User.emailOTP) {
                // const user = await UserTempModel.findOneAndUpdate({ email: email }, { $set: { accountVerified: true } }, { new: true });
                const user = await UserModel.create({ email: email, accountVerified: true, full_name: User.full_name, date_of_birth: User.date_of_birth });
                await userSteps.create({ userId: user._id, otpVefication: true });
                await UserTempModel.findOneAndDelete({ email: email });
                result.status = 200;
                result.user = user;
                result.message = "OTP verification successful."
            }
            else {
                throw Error("Invalid OTP.")
            }
        }
        catch (error) {
            result.status = 400;
            result.message = error.message;
        }
        return result;
    },

    resendEmailVerifiacationOTP: async function (email) {
        let result = {};
        let otp = Math.floor(1000 + Math.random() * 9000);
        try {
            const userTemp = await UserTempModel.findOneAndUpdate({ email: email }, { emailOTP: otp });
            let mailData = {
                full_name: userTemp.full_name,
                otp: otp
            }

            ejs.renderFile("./views/emailverification.ejs", mailData, (err, htmlData) => {
                if (err) {
                    throw Error("We are unable to send email now.")
                }
                let subject = "OTP Verification";
                const newContent = htmlData;
                let params = {
                    to: email,
                    subject: subject,
                    text: newContent
                }
                utils.emailSend(params);
            })
            result.status = 200;
            result.email = email;
            result.message = "Success";

        }
        catch (error) {
            result.status = 400;
            result.message = error.message
        }
        return result;
    },

    passwordUpdate: async function (email, password) {
        console.log("email:", email, password)
        let result = {};
        let saltRounds = 10;
        try {
            let salt = bcrypt.genSaltSync(saltRounds); // creating salt
            let hash = bcrypt.hashSync(password, salt);
            // const user = await UserModel.create({ email: email, accountVerified: true, full_name: userTemp.full_name, date_of_birth: userTemp.date_of_birth, password: hash });
            // await UserTempModel.findOneAndDelete({ email: email });
            const user = await UserModel.findOneAndUpdate({ email: email }, { $set: { password: hash } }, { new: true })
            await userSteps.findOneAndUpdate({ userId: user._id }, { passwordUpdate: true }, { new: true });
            result.status = 200;
            result.message = "Success";
            result.user = user;
        }
        catch (error) {
            result.status = 400;
            result.message = error.message;
        }
        return result;
    },

    update_username: async (id, user_name) => {
        let result = {};
        try {
            if (user_name) {
                const isUserNameExist = await UserModel.findOne({
                    user_name,
                });
                if (isUserNameExist) {
                    const userNameSuggestionArr = [];
                    while (userNameSuggestionArr.length < 3) {
                        const suggestedUserName = utils.generateUsername(user_name);
                        const userNameExist = await UserModel.findOne({
                            user_name: suggestedUserName,
                        });
                        if (!userNameExist) {
                            userNameSuggestionArr.push(suggestedUserName);
                        }
                    }
                    result.status = 200;
                    result.message = "Username already exist!";
                    result.userNameSuggestionArr = userNameSuggestionArr;
                    return result;
                } else {
                    await UserModel.findByIdAndUpdate(
                        ObjectId(id),
                        { user_name },
                        { new: true }
                    );
                    await userSteps.findOneAndUpdate({ userId: id }, { ProfileUpdates: true, usernameUpdate: true })
                    let user = await UserModel.findOne({ _id: id });
                    result.status = 200;
                    result.user = user;
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

    change_email: async (id, email) => {
        let result = {};
        try {
            const emailAlreadyExist = await UserTempModel.findOne({ email: email });
            if (emailAlreadyExist) {
                result.status = 200;
                result.message = "Email already exists."
                return result
            }
            else {
                let otp = Math.floor(1000 + Math.random() * 9000);
                await UserTempModel.findOneAndUpdate({ _id: id }, { email: email, emailOTP: otp }, { new: true });
                const user = await UserTempModel.findOne({ _id: id });

                let mailData = {
                    full_name: user.full_name,
                    otp: otp
                }

                ejs.renderFile("./views/emailverification.ejs", mailData, (err, htmlData) => {
                    if (err) {
                        throw Error("We are unable to send email now.")
                    }
                    let subject = "OTP Verification";
                    const newContent = htmlData;
                    let params = {
                        to: email,
                        subject: subject,
                        text: newContent
                    }
                    utils.emailSend(params);
                })
                result.status = 200;
                result.message = "Email updated successfully!";
                result.user = user;
                return result;
            }

        }
        catch (error) {
            result.status = 400;
            result.message = error.message;
            return result
        }
    },

    update_Bio: async (id, bio) => {
        let result = {};
        try {
            const user = await UserModel.findOneAndUpdate({ _id: id }, { $set: { bio: bio } }, { new: true });
            await userSteps.findOneAndUpdate({ userId: id }, { $set: { bioUpdate: true } }, { new: true });
            result.status = 200;
            result.user = user;
            result.message = "Bio updated successfully."
        }
        catch (error) {
            result.status = 400;
            result.message = error.message;
        }
        return result;
    },

    update_ProfileImage: async (id, profile_img) => {
        let result = {};
        try {
            const user = await UserModel.findOneAndUpdate({ _id: id }, { $set: { profile_img: profile_img, isAvatar: true } }, { new: true });
            await userSteps.findOneAndUpdate({ _id: id }, { $set: { profilepictureUpdate: true } })
            result.status = 200;
            result.user = user;
            result.message = "Avatar updated successfully."
        }
        catch (err) {
            result.status = 400;
            result.message = err.message;
        }
        return result;
    },

    signup_Google: async (obj) => {
        let result = {};
        try {
            const emailExists = await UserModel.findOne({ email: obj.email });
            if (emailExists) {
                result.message = "Email already exist.";
                result.status = 200;
                return result;
            }
            let user = await UserModel.create({ ...obj, accountVerified: true });
            await userSteps.create({ userId: user._id, otpVefication: true, passwordUpdate: true, ProfileUpdates: true });
            result.status = 200;
            result.message = "User created successfully.";
            result.user = user;
        }
        catch (error) {
            result.status = 400;
            result.message = error.message;
        }
        return result;
    },

    update_Password_auth: async (email, date_of_birth) => {
        let result = {};
        try {
            let user = await UserModel.findOneAndUpdate({ email: email }, { $set: { date_of_birth: date_of_birth } }, { new: true });
            await userSteps.findOneAndUpdate({ userId: user._id }, { profilepictureUpdate: true })
            result.status = 200;
            result.message = "date of birth updated successfully.";
            result.user = user
        }
        catch (error) {
            result.status = 400;
            result.message = error.message;
        }
        return result;
    },

    skip_onboardingsteps: async (id, body) => {
        let result = {};
        console.log("body:", id, body)
        try {
            await userSteps.findOneAndUpdate({ userId: id }, { $set: { ...body } }, { new: true });
            result.status = 200;
            result.message = "stage skipped."
        }
        catch (error) {
            result.status = 400;
            result.message = error.message;
        }
        return result;
    }


}
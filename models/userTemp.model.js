const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        user_name: {
            type: String,
            default: "",
        },
        first_name: {
            type: String,
            default: ""
        },
        last_name: {
            type: String,
            default: ""
        },
        email: {
            type: String,
        },
        gender: {
            type: String,
            default: "",
        },
        reset_password_token: {
            type: String,
        },
        active_token: {
            type: String,
        },
        reset_password_expires: {
            type: Date,
            select: false,
        },
        profile_img: {
            type: String,
            default: "",
        },
        cover_img: {
            type: String,
            default: "",
        },
        title: {
            type: String,
        },
        role: {
            type: [
                {
                    type: String,
                    enum: ["admin", "userFree", "userPaid"],
                },
            ],
            default: ["userFree"],
        },
        subscription_details: {
            //will be filled and applied only for paid subscription
            from: { type: Date },
            to: { type: Date },
            isPaid: {
                type: Boolean,
                default: false,
            },
            cancel_status: {
                type: String,
                enum: [
                    "reqSent", // set status to reqSent at time of initiating cancel request
                    "reqCancel", // set status to reqCancel if we have already sent a cancellation request and we want to cancel the cancel request
                    "reqComplete", // Once cancel request is completed
                    "noReqSent", // this is default status when user had not sent any cancellation request
                ],
                default: "noReqSent",
            },
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        date_of_birth: {
            type: Date,
        },
        location: {
            type: String,
        },
        followers: {
            type: Number,
            default: 0,
        },
        following: {
            type: Number,
            default: 0,
        },
        loginAt: {
            type: Date,
            default: "",
        },
        setting: {
            type: {
                private: {
                    type: Boolean,
                    default: false,
                },
                email_verification: {
                    type: Boolean,
                    default: false,
                },
            },
        },
        first_view: {
            type: [String],
            default: [],
        },
        is_online: {
            type: Boolean,
            default: true,
        },
        accountVerified: {
            type: Boolean,
            default: false,
        },
        investmentInterests: {
            type: [String],
            default: []
        },
        websiteUrl: {
            type: String,
            default: ""
        },
        // Mobile User Needed Keys
        full_name: {
            type: String,
        },
        mobile_no: {
            type: String,
        },
        countryCode: {
            type: String,
        },
        emailOTP: {
            type: Number,
        },
        mobileOTP: {
            type: Number,
        },
        isMobileVerified: {
            type: Boolean,
            default: false,
        },
        isSocialLogin: {
            type: Boolean,
            default: false
        },
        bio: {
            type: String, default: ""
        },
        password: {
            type: String,
            default: null,
            select: false
        },
        is_delete: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: "createdAt" } }
);


userSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.password) {
        let salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
        let hash = bcrypt.hashSync(update.password, salt);
        console.log(hash);
        update.password = hash
    }
    next();
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.hash_password);
};

let User = mongoose.model("Usertemp", userSchema);
module.exports = User;

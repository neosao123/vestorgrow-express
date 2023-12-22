const mongoose = require("mongoose")

const UserStepsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        otpVefication: {
            type: Boolean,
            default: false,
        },
        passwordUpdate: {
            type: Boolean,
            default: false
        },
        ProfileUpdates: {
            type: Boolean,
            default: false
        },
        usernameUpdate: {
            type: Boolean,
            default: false
        },
        bioUpdate: {
            type: Boolean,
            default: false
        },
        UserSuggestions: {
            type: Boolean,
            default: false
        },
        groupSuggestion: {
            type: Boolean,
            default: false
        },
        profilepictureUpdate: {
            type: Boolean,
            default: false
        },
        
    },
    {
        timestamps: { createdAt: "createdAt" },
        versionKey: false
    }
);
const StepsModel = mongoose.model("VerificationSteps", UserStepsSchema)
module.exports = StepsModel;
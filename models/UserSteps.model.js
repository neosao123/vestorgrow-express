const mongoose = require("mongoose")

const UserStepsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        ProfileUpdates: {
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
        }
    },
    {
        timestamps: { createdAt: "createdAt" },
        versionKey: false
    }
);
const StepsModel = mongoose.model("VerificationSteps", UserStepsSchema)
module.exports = StepsModel;
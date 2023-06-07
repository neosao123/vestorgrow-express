const mongoose = require("mongoose");

const GroupInvitationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    from_user: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "createdAt" } }
);

let GroupInvitation = mongoose.model("GroupInvitation", GroupInvitationSchema);
module.exports = GroupInvitation;

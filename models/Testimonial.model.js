const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    message: {
      type: String,
    },
    designation: {
      type: String,
    },
    image: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: { createdAt: "createdAt" } }
);

const TestimonialRequest = mongoose.model("TestimonialRequest", testimonialSchema);

module.exports = TestimonialRequest;

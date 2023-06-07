const mongoose = require("mongoose");

const payment_schema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    session_id: {
      type: String,
    },
    status: {
      type: String,
    },
    stripe_customer_id: {
      type: String,
      // required: true,
    },
    invoice_pdf: {
      type: String,
    },
    subscription_id: {
      type: String,
    },
    stripe_data: {
      type: String,
    },
    invoice_number: {
      type: String,
    },
  },
  { timestamps: { createdAt: "createdAt" } }
);
let Payment = mongoose.model("Payment", payment_schema);
module.exports = Payment;

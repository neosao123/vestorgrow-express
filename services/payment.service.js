const utils = require("../utils/utils");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRETE_KEY);
const bodyParser = require("body-parser");
const qs = require("qs");
const Payment = require("../models/Payment.model");
const User = require("../models/User.model");
var moment = require("moment");

module.exports = {
  // createSubsCheckout: async function (createSubscriptionRequest) {
  //   const customer = await stripe.customers.create({
  //     metadata: {
  //       name: createSubscriptionRequest.name,
  //       email: createSubscriptionRequest.email,
  //       priceId: createSubscriptionRequest.priceId,
  //       userId: createSubscriptionRequest._id,
  //     },
  //   });

  //   const priceId = createSubscriptionRequest.priceId;
  //   const session = await stripe.checkout.sessions.create({
  //     billing_address_collection: "auto",
  //     line_items: [
  //       {
  //         price: createSubscriptionRequest.priceId,
  //         quantity: 1,
  //       },
  //     ],
  //     customer: customer.id,
  //     mode: "subscription",
  // success_url: `${process.env.FRONTEND_BASE_URL}/setting/billing/?success=true&session_id={CHECKOUT_SESSION_ID}`,
  //     cancel_url: `${process.env.FRONTEND_BASE_URL}/?canceled=true`,
  //   });

  //   return {
  //     url: session.url,
  //   };
  // },
  RedirectCustPortal: async function (request, response) {
    let event = request.body;
    // const endpointSecret = "we_1MoiRPEudKlt44ZAsmdeZqyw";
    // console.log("event111", event);

    // if (endpointSecret) {
    //   const signature = request.headers["stripe-signature"];
    //   console.log("signature111", signature);
    //   console.log("signature111", endpointSecret);
    //   try {
    //     event = stripe.webhooks.constructEvent(request.rawBody, signature, endpointSecret);
    //     console.log("eventrerere113", event);
    //   } catch (err) {
    //     console.log(`⚠️  Webhook signature verification failed.`, err.message);
    //     return err;
    //   }
    // }
    let subscription;
    let status;
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        try {
          if (checkoutSessionCompleted) {
            const usr = await Payment.findOne({ session_id: checkoutSessionCompleted.id }).sort({ createdAt: "desc" });
            if (usr) {
              const data = {
                subscription_id: checkoutSessionCompleted.subscription,
                status: "success",
                invoice_number: checkoutSessionCompleted.invoice,
              };
              const result = await Payment.findOneAndUpdate(
                { session_id: checkoutSessionCompleted.id },
                { $set: data },
                { new: true }
              );

              let obj = {
                role: ["userPaid"],
                subscription_details: {
                  isPaid: checkoutSessionCompleted.payment_status == "paid" ? true : false,
                },
              };
              const userData = await User.findOne({ _id: usr.user_id });
              userData.subscription_details.isPaid = checkoutSessionCompleted.payment_status == "paid" ? true : false;
              await userData.save();
            }
          }
        } catch (error) {
          console.log(error);
        }
        // Then define and call a function to handle the event checkout.session.completed
        break;
      case "invoice.paid":
        const invoicePaid = event.data.object;
        try {
          if (invoicePaid) {
            const usr = await Payment.findOne({ stripe_customer_id: invoicePaid.customer }).sort({ createdAt: "desc" });
            if (usr) {
              if (usr.invoice_number === invoicePaid.id) {
                const data = {
                  invoice_pdf: invoicePaid.invoice_pdf,
                  stripe_data: JSON.stringify(invoicePaid),
                };
                const result = await Payment.findOneAndUpdate(
                  { invoice_number: invoicePaid.id },
                  { $set: data },
                  { new: true }
                );
                let obj = {
                  role: ["userPaid"],
                  subscription_details: {
                    from: moment.unix(invoicePaid.data.period.start).format(),
                    to: moment.unix(invoicePaid.lines.data.period.end).format(),
                    isPaid: invoicePaid.paid ? true : false,
                  },
                };
                const userData = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: obj }, { new: true });
              } else {
                const userDetail = {
                  user_id: usr.user_id,
                  amount: invoicePaid.price.id == "price_1MmGXcEudKlt44ZApERiivQy" ? 49.99 : 499.0,
                  status: "success",
                  stripe_customer_id: invoicePaid.customer,
                  invoice_pdf: invoicePaid.invoice_pdf,
                  stripe_data: JSON.stringify(invoicePaid),
                  subscription_id: invoicePaid.subscription,
                  stripe_data: JSON.stringify(invoicePaid),
                  invoice_number: invoicePaid.id,
                };
                const result = await new Payment(userDetail).save();
                let obj = {
                  role: ["userPaid"],
                  subscription_details: {
                    from: moment.unix(invoicePaid.data.period.start).format(),
                    to: moment.unix(invoicePaid.data.period.end).format(),
                    isPaid: invoicePaid.paid ? true : false,
                  },
                };
                const userData = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: obj }, { new: true });
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
        // Then define and call a function to handle the event invoice.paid
        break;
      case "invoice.payment_failed":
        const invoicePaymentFailed = event.data.object;
        try {
          if (invoicePaymentFailed) {
            const usr = await Payment.findOne({ stripe_customer_id: invoicePaymentFailed.customer }).sort({
              createdAt: "desc",
            });
            if (usr.status == "In Process" || usr.status == "cancelled") {
              const data = {
                status: "failed",
                stripe_customer_id: invoicePaymentFailed.customer,
                invoice_pdf: invoicePaymentFailed.invoice_pdf,
                stripe_data: JSON.stringify(invoicePaymentFailed),
                subscription_id: invoicePaymentFailed.subscription,
                invoice_number: invoicePaymentFailed.id,
              };
              const result = await Payment.findOneAndUpdate(
                { stripe_customer_id: invoicePaymentFailed.customer },
                { $set: data },
                { new: true }
              );
            } else {
              const data = {
                user_id: usr.user_id,
                amount: invoicePaymentFailed.amount_due,
                status: "failed",
                stripe_customer_id: invoicePaymentFailed.customer,
                invoice_pdf: invoicePaymentFailed.invoice_pdf,
                stripe_data: JSON.stringify(invoicePaymentFailed),
                subscription_id: invoicePaymentFailed.subscription,
                invoice_number: invoicePaymentFailed.id,
              };
              const result = await new Payment(data).save();
            }

            let obj = {
              role: ["userFree"],
              subscription_details: {
                from: moment.unix(invoicePaymentFailed.period_start).format(),
                to: moment.unix(invoicePaymentFailed.period_end).format(),
                isPaid: invoicePaymentFailed.paid,
              },
            };
            const userData = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: obj }, { new: true });
          }
        } catch (error) {
          console.log(error);
        }
        // Then define and call a function to handle the event invoice.payment_failed
        break;

      case "customer.subscription.deleted":
        const customerSubscriptionDeleted = event.data.object;
        try {
          if (!customerSubscriptionDeleted.cancel_at_period_end && customerSubscriptionDeleted.status == "canceled") {
            const usr = await Payment.findOne({
              $and: [
                { stripe_customer_id: customerSubscriptionDeleted.customer },
                { subscription_id: customerSubscriptionDeleted.id },
              ],
            }).sort({ createdAt: "desc" });
            if (usr.user_id) {
              let data = {
                role: ["userFree"],
                subscription_details: {
                  isPaid: false,
                  cancel_status: "reqComplete",
                },
              };
              const resp = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: data }, { new: true });
            }
          }
        } catch (error) {
          console.log(error);
        }
        // Then define and call a function to handle the event customer.subscription.deleted
        break;
      case "customer.subscription.updated":
        const customerSubscriptionUpdated = event.data.object;
        try {
          if (customerSubscriptionUpdated.cancel_at_period_end) {
            const usr = await Payment.findOne({
              $and: [
                { stripe_customer_id: customerSubscriptionUpdated.customer },
                { subscription_id: customerSubscriptionUpdated.id },
              ],
            }).sort({ createdAt: "desc" });
            if (usr.user_id) {
              let data = {
                subscription_details: {
                  isPaid: true,
                  from: moment.unix(customerSubscriptionUpdated.current_period_start).format(),
                  to: moment.unix(customerSubscriptionUpdated.current_period_end).format(),
                  cancel_status: "reqSent",
                },
              };
              const resp = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: data }, { new: true });
            }
          } else if (
            !customerSubscriptionUpdated.cancel_at_period_end &&
            customerSubscriptionUpdated.status == "canceled"
          ) {
            const usr = await Payment.findOne({
              $and: [
                { stripe_customer_id: customerSubscriptionUpdated.customer },
                { subscription_id: customerSubscriptionUpdated.id },
              ],
            }).sort({ createdAt: "desc" });
            if (usr.user_id) {
              let data = {
                role: ["userFree"],
                subscription_details: {
                  isPaid: false,
                  cancel_status: "reqComplete",
                },
              };
              const resp = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: data }, { new: true });
            }
          } else if (
            !customerSubscriptionUpdated.cancel_at_period_end &&
            customerSubscriptionUpdated.status == "active"
          ) {
            const usr = await Payment.findOne({
              $and: [
                { stripe_customer_id: customerSubscriptionUpdated.customer },
                { subscription_id: customerSubscriptionUpdated.id },
              ],
            }).sort({ createdAt: "desc" });
            if (usr.user_id) {
              let data = {
                role: ["userPaid"],
                subscription_details: {
                  isPaid: true,
                  from: moment.unix(customerSubscriptionUpdated.current_period_start).format(),
                  to: moment.unix(customerSubscriptionUpdated.current_period_end).format(),
                },
              };
              const resp = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: data }, { new: true });
            }
          }
        } catch (error) {
          console.log(error);
        }
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    response.send(event);
  },

  // createCustPortal: async function (req) {
  //   console.log(req);
  //   const { session_id } = req;
  //   const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
  //   const returnUrl = `${process.env.FRONTEND_BASE_URL}/settings/billing`;

  //   const portalSession = await stripe.billingPortal.sessions.create({
  //     customer: checkoutSession.customer,
  //     return_url: returnUrl,
  //   });

  //   console.log("portalSeiion", portalSession);
  //   return portalSession;
  // },
  createSubsCheckout: async function (data) {
    const customer = await stripe.customers.create({
      email: data.email,
      metadata: {
        name: data.name,
        email: data.email,
      },
    });
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: data.monthly == true ? "price_1MmGXcEudKlt44ZApERiivQy" : "price_1MmGXcEudKlt44ZA6JCYOA5d",
            quantity: 1,
          },
        ],
        customer: customer.id,
        mode: "subscription",
        success_url: `${process.env.FRONTEND_BASE_URL}/setting/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_BASE_URL}/setting/billing?canceled=true&session_id={CHECKOUT_SESSION_ID}`,
      });
      if (checkoutSession.id && customer.id) {
        const userDetail = {
          user_id: data.userId,
          amount: data.monthly == true ? 49.99 : 499.0,
          status: "In Process",
          session_id: checkoutSession.id,
          stripe_customer_id: customer.id,
        };
        const result = await new Payment(userDetail).save();
      }

      return { url: checkoutSession.url };
    } catch (err) {
      return { error: err.message };
    }
  },
  cancelSubscription: async function (data) {
    let result = { data: null };
    try {
      const usr = await Payment.findOne({ $and: [{ user_id: data.user_id }, { status: "success" }] }).sort({
        createdAt: "desc",
      });
      if (usr) {
        // result.data = await stripe.subscriptions.del(usr.subscription_id);
        result.data = await stripe.subscriptions.update(usr.subscription_id, { cancel_at_period_end: true });
        if (result.data.cancel_at_period_end) {
          let data = {
            subscription_details: {
              cancel_status: "reqSent",
            },
          };
          const resp = await User.findOneAndUpdate({ user_id: data.user_id }, { $set: data }, { new: true });
        }
      }
      return {
        result: result.data,
      };
    } catch (err) {
      return { error: err.message };
    }
  },

  retrieveSubscription: async function (data) {
    let result = { data: null };
    try {
      const usr = await Payment.findOne({ $and: [{ user_id: data.user_id }, { status: "success" }] }).sort({
        createdAt: "desc",
      });
      if (usr) {
        const subscription = await stripe.subscriptions.retrieve(usr.subscription_id);
        result.data = await stripe.subscriptions.update(usr.subscription_id, {
          cancel_at_period_end: false,
          proration_behavior: "create_prorations",
          items: [
            {
              id: subscription.items.data[0].id,
              price: subscription.plan.id,
            },
          ],
        });
        if (result.data && !result.data.cancel_at_period_end) {
          let data = {
            subscription_details: {
              isPaid: true,
              from: moment.unix(result.data.current_period_start).format(),
              to: moment.unix(result.data.current_period_end).format(),
              cancel_status: "reqCancel",
            },
          };

          const user = await User.findOneAndUpdate({ _id: usr.user_id }, { $set: data }, { new: true });
        }
      }
      return {
        result: result.data,
      };
    } catch (err) {
      return { error: err.message };
    }
  },

  statusCheckoutSession: async function (data) {
    let result = { data: null };
    try {
      const usr = await Payment.findOne({ session_id: data.session_id });
      if (usr) {
        result.data = await Payment.findOneAndUpdate({ session_id: data.session_id }, { $set: data }, { new: true });
      }
      return {
        result: result.data,
        message: result.data.status == "success" ? "Payment Done Successfully" : "Payment Cancelled",
      };
    } catch (err) {
      return { error: err.message };
    }
  },
  listAllPayments: async function (paymentObj, currUser) {
    let result = {};
    let data = null;
    let count;
    let condition = {};
    const { start, length } = paymentObj;
    condition = { $and: [{ user_id: currUser._id }, { status: "success" }] };

    try {
      if (start === undefined || length === undefined) {
        data = await Payment.find(condition).sort({
          createdAt: "desc",
        });
      } else {
        data = await Payment.find(condition).limit(parseInt(length)).skip(start).sort({
          createdAt: "desc",
        });
      }
      count = await Payment.countDocuments(condition);
      result = {
        data: data,
        total: count,
        currPage: parseInt(start / length) + 1,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },

  getLastPayment: async function (currUser) {
    let result = {};
    let data = null;
    let condition = {};
    condition = { $and: [{ user_id: currUser._id }, { status: "success" }] };

    try {
      data = await Payment.findOne(condition).sort({ createdAt: "desc" });
      result = {
        data: data,
      };
    } catch (err) {
      result.err = err.message;
    }
    return result;
  },
};

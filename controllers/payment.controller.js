// const notificationServ = require("../services/Notification.service");
const utils = require("../utils/utils");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const paymentServ = require("../services/payment.service");

module.exports = {
  createSubsSession: async function (req, res) {
    const result = await paymentServ.createSubsCheckout(req.body);
    utils.sendResponse(result, req, res);
  },

  RedirectCustPortal: async function (request, response) {
    const resp = await paymentServ.RedirectCustPortal(request, response);
  },

  createCustPortal: async function (req, res) {
    const session = await paymentServ.createCustPortal(req.body);
    res.redirect({
      url: session.url,
    });
  },
  statusCheckoutSession: async function (req, res) {
    const result = await paymentServ.statusCheckoutSession(req.body);
    utils.sendResponse(result, req, res);
  },

  listAllPayments: async function (req, res) {
    let result = await paymentServ.listAllPayments(req.body, req.currUser);
    utils.sendResponse(result, req, res);
  },
  cancelSubscription: async function (req, res) {
    const result = await paymentServ.cancelSubscription(req.body);
    utils.sendResponse(result, req, res);
  },

  getLastPayment: async function (req, res) {
    let result = await paymentServ.getLastPayment(req.currUser);
    utils.sendResponse(result, req, res);
  },

  retrieveSubscription: async function (req, res) {
    const result = await paymentServ.retrieveSubscription(req.body);
    utils.sendResponse(result, req, res);
  },
};

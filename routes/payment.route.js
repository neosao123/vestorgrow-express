const router = require("express").Router();
const auth = require("../middleware/auth");
const express = require("express");
const paymentController = require("../controllers/payment.controller");

router.route("/webhook").post(express.raw({ type: "application/json" }), paymentController.RedirectCustPortal);
router.route("/create-portal-session").post(paymentController.createCustPortal);
router.route("/create-checkout-session").post(paymentController.createSubsSession);
router.route("/status-checkout-session").post(paymentController.statusCheckoutSession);
router.route("/list-all-payments").post(auth, paymentController.listAllPayments);
router.route("/cancel-subscription").post(auth, paymentController.cancelSubscription);
router.route("/retrieve-subscription").post(auth, paymentController.retrieveSubscription);
router.route("/get-last-payment").post(auth, paymentController.getLastPayment);

module.exports = router;

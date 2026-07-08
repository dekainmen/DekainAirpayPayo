const express = require("express");
const router = express.Router();

/**
 * Controllers
 */
const paymentController =
  require("../controllers/paymentcontroller");

/**
 * NEW: Airpay Webhook Controller
 */
const airpayWebhookController =
  require("../controllers/webhook.controller"); //

  router.post(
  "/webhook/airpay",
  airpayWebhookController.airpayWebhook
);

/**
 * Webhook Handler
 * (Gateway callback)
 */
const webhookHandler =
  require("../gateway/custom/webhook");

/**
 * ===============================
 * Create Payment Order
 * ===============================
 * POST /api/payment/create
 */
router.post(
  "/create",
  paymentController.createPayment
);

/**
 * ===============================
 * Gateway Webhook
 * ===============================
 * POST /api/payment/webhook
 */
router.post(
  "/webhook",
  webhookHandler
);

/**
 * ===============================
 * Test Route (Optional Debug)
 * ===============================
 */
router.get("/test", (req, res) => {
  res.send("Payment routes working");
});

module.exports = router;

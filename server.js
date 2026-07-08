require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

/**
 * ===============================
 * Middleware
 * ===============================
 */

// Parse JSON
app.use(bodyParser.json());

// Parse x-www-form-urlencoded
// Required for payment redirects + webhooks
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

/**
 * ===============================
 * Static Frontend
 * ===============================
 */

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

/**
 * ===============================
 * Routes
 * ===============================
 */

// Payment Routes
app.use(
  "/api/payment",
  require("./routes/payment.routes")
);

// Products Routes
app.use(
  "/api/products",
  require("./routes/products.routes")
);

// Orders Routes
app.use(
  "/api/orders",
  require("./routes/orders.routes")
);

/**
 * ===============================
 * Gateway Return URL (SAFE)
 * ===============================
 * Handles redirect from gateway
 * Supports GET + POST
 * Crash-protected
 */

app.all("/payments/return", (req, res) => {

  console.log("=================================");
  console.log("PAYMENT RETURN HIT");
  console.log("METHOD:", req.method);
  console.log("QUERY:", req.query);
  console.log("BODY:", req.body);
  console.log("=================================");

  try {

    /**
     * Merge query + body safely
     */
    const data = {
      ...(req.query || {}),
      ...(req.body || {})
    };

    /**
     * Extract status safely
     */
    const status =
      data.status ||
      data.txn_status ||
      data.payment_status ||
      data.result ||
      data.paymentStatus ||
      "UNKNOWN";

    /**
     * Extract order id safely
     */
    const order_id =
      data.order_id ||
      data.txnid ||
      data.orderId ||
      data.merchant_order_id ||
      data.orderid ||
      "NA";

    const normalizedStatus =
      String(status).toUpperCase();

    console.log(
      "Normalized Status:",
      normalizedStatus,
      "Order ID:",
      order_id
    );

    /**
     * SUCCESS CASE
     */
    if (
      normalizedStatus === "SUCCESS" ||
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "PAID"
    ) {

      return res.redirect(
        `/success.html?order_id=${order_id}`
      );
    }

    /**
     * FAILURE / DEFAULT
     */
    return res.redirect(
      `/failure.html?order_id=${order_id}`
    );

  } catch (error) {

    console.error(
      "RETURN ROUTE ERROR:",
      error
    );

    return res
      .status(500)
      .send("Return handling error");
  }
});

const airpayService = require("./services/airpay.service");
const kv = require("./config/kv");

app.all(["/payment/return", "/api/airpay-return"], async (req, res) => {

  console.log("=================================");
  console.log("PAYMENT RETURN HIT");
  console.log("METHOD:", req.method);
  console.log("=================================");

  try {
    const responseData = req.body.response || req.query.response;
    if (!responseData) {
      console.error("Missing response data in redirect");
      return res.redirect("/failure.html?error=missing_data");
    }

    const verification = await airpayService.verifyResponse(responseData);
    const { orderId, status, isValid } = verification;

    if (!isValid) {
      console.error("INVALID CHECKSUM ON RETURN:", orderId);
      return res.redirect(`/failure.html?order_id=${orderId}&error=invalid_hash`);
    }

    // Update order in KV
    const existing = await kv.get(`order:${orderId}`);
    if (existing) {
      const order = typeof existing === "string" ? JSON.parse(existing) : existing;
      
      // status 200 is success in Airpay
      if (String(status) === "200") {
        order.status = "SUCCESS";
      } else {
        order.status = "FAILED";
      }

      order.gateway_response = verification.data;
      order.updated_at = Date.now();
      await kv.set(`order:${orderId}`, JSON.stringify(order));
      console.log("ORDER UPDATED ON RETURN:", orderId, order.status);
    }

    if (String(status) === "200") {
      return res.redirect(`/success.html?order_id=${orderId}`);
    } else {
      return res.redirect(`/failure.html?order_id=${orderId}`);
    }

  } catch (error) {
    console.error("RETURN ROUTE ERROR:", error.message);
    return res.status(500).send("Return handling error");
  }
});

/**
 * ===============================
 * Health Check
 * ===============================
 */

app.get("/health", (req, res) => {
  res.send("Server running");
});

/**
 * ===============================
 * Start Server
 * ===============================
 */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(
    `Server running on ${PORT}`
  )
);

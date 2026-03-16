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
 * Gateway Return URL
 * ===============================
 * Handles redirect from gateway
 * Always sends user to homepage
 */

app.all("/payment-return", (req, res) => {

  console.log("=================================");
  console.log("PAYMENT RETURN HIT");
  console.log("METHOD:", req.method);
  console.log("QUERY:", req.query);
  console.log("BODY:", req.body);
  console.log("=================================");

  try {

    const data = {
      ...(req.query || {}),
      ...(req.body || {})
    };

    const status =
      data.status ||
      data.txn_status ||
      data.payment_status ||
      data.result ||
      data.paymentStatus ||
      "UNKNOWN";

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
     * Redirect directly to homepage
     */

    return res.redirect("/");

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
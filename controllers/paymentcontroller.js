const paymentService =
  require("../services/payment.service");

const kv =
  require("../config/kv");

exports.createPayment =
  async (req, res) => {

    console.log("REQ BODY:", req.body);

    /**
     * Create order ID first
     */
    const orderId =
      "ORD_" + Date.now();

    try {

      const {
        products,
        customer
      } = req.body;

      /**
       * Calculate amount
       */
      const amount =
        products?.length
          ? products.reduce(
              (sum, p) => sum + (p.price * p.qty),
              0
            )
          : req.body.amount || 0;

      const name =
        customer?.name || "Guest";

      const email =
        customer?.email || "";

      const phone =
        customer?.phone || "";

      /**
       * Determine payment method and status
       */
      const payment_method = req.body.provider || "cashfree";
      const payment_status = payment_method === "cod" ? "Pending" : "PENDING";
      const order_status = payment_method === "cod" ? "Placed" : "PENDING";

      /**
       * Store order in KV
       */
      await kv.set(
        `order:${orderId}`,
        JSON.stringify({
          order_id: orderId,
          amount,
          name,
          email,
          phone,
          payment_method,
          payment_status,
          order_status,
          status: payment_status,
          created_at: Date.now()
        })
      );

      console.log(
        "KV WRITE SUCCESS:",
        `order:${orderId}`
      );

      console.log(
        "ORDER SAVED:",
        orderId
      );

      console.log(
        "RETURN_URL VALUE:",
        process.env.RETURN_URL
      );

      /**
       * Create payment
       */
      const response =
        await paymentService.createOrder({
          provider: req.body.provider,
          order_id: orderId,
          amount,
          phone,
          email,
          name,
          redirect_url:
            process.env.RETURN_URL,
          remark1: name,
          remark2: email
        });

      console.log(
        "GATEWAY RESPONSE:",
        response
      );

      /**
       * COD Response
       */
      if (response?.status === "SUCCESS" && response?.provider === "cod") {
        return res.json({
          success: true,
          provider: "cod",
          order_id: orderId
        });
      }

      /**
       * AIRPAY Form Response
       */
      if (response?.type === "form") {
        return res.json(response);
      }

      /**
       * CASHFREE Response
       */
      if (
        response?.status === "SUCCESS" &&
        response?.payment_session_id
      ) {
        return res.json({
          success: true,
          provider: "cashfree",
          payment_session_id:
            response.payment_session_id,
          order_id:
            response.order_id,
          cf_order_id:
            response.cf_order_id
        });
      }

      /**
       * Existing Gateway Response
       */
      if (
        response?.status === "SUCCESS" &&
        response?.paymentUrl
      ) {
        return res.json({
          success: true,
          paymentUrl:
            response.paymentUrl
        });
      }

      /**
       * Gateway Failed
       */
      return res.status(400).json({
        success: false,
        message:
          "Payment creation failed",
        order_id: orderId
      });

    } catch (err) {

      console.error(
        "CREATE PAYMENT ERROR:",
        err.response?.data ||
        err.message ||
        err
      );

      return res.status(500).json({
        success: false,
        error: "Payment failed",
        reason:
          err.response?.data ||
          err.message,
        order_id: orderId
      });
    }
};

const paymentService =
  require("../services/payment.service");

const kv =
  require("../config/kv");

exports.createPayment =
  async (req, res) => {
console.log("REQ BODY:", req.body);
  /**
   * Create order ID first
   * So it exists even if gateway fails
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
        status: "PENDING",
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
     * Call payment gateway
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

    // /**
    //  * Success response
    //  */
    // res.json({
    //   ...response,
    //   order_id: orderId,
    //   amt : amount,
    //   phn: phone,
    // });

    console.log(
      "GATEWAY RESPONSE:",
      response
    );

if (response?.type === "form") {
  return res.json(response);
}


if (response?.status === "SUCCESS" && response?.paymentUrl) {
  return res.json({
    success: true,
    paymentUrl: response.paymentUrl
  });
}

/**
 * If gateway failed → Send error
 */
return res.status(400).json({
  success: false,
  message: "Payment creation failed",
  order_id: orderId
});

  } catch (err) {

    console.error(
      "CREATE PAYMENT ERROR:",
      err.response?.data ||
      err.message ||
      err
    );

    /**
     * Failure response
     * Still return order_id
     */
    res.status(500).json({
      error: "Payment failed",
      reason:
        err.response?.data ||
        err.message,
      order_id: orderId
    });
  }
};

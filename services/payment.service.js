console.log(
  "USER_TOKEN FROM ENV:",
  process.env.PAYTOKEN
);


require("dotenv").config();

const axios = require("axios");
const qs = require("querystring");

const airpayService = require("./airpay.service"); 
// adjust path if inside /payments folder

/**
 * Create Payment Order
 */
async function createOrder(payload) {

  try {
     if (payload.provider === "airpay") {
      console.log("Routing to AIRPAY");
      return await airpayService.createPayment(payload);
    }

    /**
     * ENV Validation
     */
    if (!process.env.CREATE_ORDER_URL) {
      throw new Error(
        "CREATE_ORDER_URL missing in .env"
      );
    }

    if (!process.env.PAYTOKEN) {
      throw new Error(
        "USER_TOKEN missing in .env"
      );
    }

    /**
     * Build Request Body
     */
    const body = qs.stringify({
      customer_mobile: payload.phone,
      user_token: process.env.PAYTOKEN,
      amount: payload.amount,
      order_id: payload.order_id,
      redirect_url: payload.redirect_url,
      remark1: payload.remark1 || "",
      remark2: payload.remark2 || ""
    });

    console.log(
      "CREATE ORDER REQUEST:",
      body
    );

    /**
     * Gateway API Call
     */
    const response = await axios.post(
      process.env.CREATE_ORDER_URL,
      body,
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        }
      }
    );

    console.log(
      "GATEWAY RAW RESPONSE:",
      response.data
    );

    /**
     * Gateway Validation
     */
    if (!response.data) {
      throw new Error(
        "Empty gateway response"
      );
    }

    if (!response.data.status) {
      throw new Error(
        response.data.message ||
        "Gateway rejected order"
      );
    }

    /**
     * Return Redirect URL
     */
    return {
      status: "SUCCESS",
      paymentUrl:
        response.data.result.payment_url ||
        response.data.payment_link ||
        response.data.redirect_url
    };

  } catch (err) {

    console.error(
      "CreateOrder Error FULL:",
      err.response?.data ||
      err.message ||
      err
    );

    throw err;
  }
}

module.exports = {
  createOrder
};

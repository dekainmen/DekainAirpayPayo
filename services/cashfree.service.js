const cashfree = require("../config/cashfree");

async function createPayment(payload) {
  try {
    const request = {
      order_id: payload.order_id,
      order_amount: payload.amount,
      order_currency: "INR",

      customer_details: {
        customer_id: payload.order_id,
        customer_name: payload.name,
        customer_email: payload.email,
        customer_phone: payload.phone,
      },

      order_meta: {
        return_url:
          payload.redirect_url +
          "?order_id={order_id}",
      },
    };

    const response =
      await cashfree.PGCreateOrder(request);

    return {
      status: "SUCCESS",
      payment_session_id:
        response.data.payment_session_id,
      cf_order_id:
        response.data.cf_order_id,
      order_id:
        response.data.order_id,
    };
  } catch (err) {
    console.error(
      "Cashfree Error:",
      err.response?.data || err
    );
    throw err;
  }
}

module.exports = {
  createPayment,
};
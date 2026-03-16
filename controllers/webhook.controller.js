const airpayService = require("../services/airpay.service");
const kv = require("../config/kv");

exports.airpayWebhook = async (req, res) => {
  try {
    const responseData = req.body.response;
    if (!responseData) {
      return res.status(400).send("Missing response data");
    }

    const verification = await airpayService.verifyResponse(responseData);

    if (!verification.isValid) {
      console.error("WEBHOOK INVALID CHECKSUM:", verification.orderId);
      return res.status(400).send("Invalid checksum");
    }

    const { orderId, status, message } = verification;

    // Fetch existing order from KV
    const existing = await kv.get(`order:${orderId}`);
    if (!existing) {
      console.error("WEBHOOK ORDER NOT FOUND:", orderId);
      return res.status(404).send("Order not found");
    }

    const order = typeof existing === "string" ? JSON.parse(existing) : existing;

    // Update order status
    // status 200 is success in Airpay
    if (String(status) === "200") {
      order.status = "SUCCESS";
    } else {
      order.status = "FAILED";
    }

    order.gateway_response = verification.data;
    order.updated_at = Date.now();

    // Persist update
    await kv.set(`order:${orderId}`, JSON.stringify(order));

    console.log("WEBHOOK PROCESSED:", orderId, order.status);
    res.send("Webhook processed");

  } catch (err) {
    console.error("WEBHOOK ERROR:", err.message);
    res.status(500).send("Webhook failed");
  }
};
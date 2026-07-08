const kv =
  require("../../config/kv");

/**
 * Payment Gateway Webhook
 */
module.exports =
  async (req, res) => {

  try {

    console.log(
      "==============================="
    );
    console.log(
      "WEBHOOK RECEIVED"
    );
    console.log(
      "HEADERS:",
      req.headers
    );
    console.log(
      "BODY:",
      req.body
    );
    console.log(
      "==============================="
    );

    const {
      status,
      order_id
    } = req.body;

    /**
     * Validate order_id
     */
    if (!order_id) {

      console.log(
        "Missing order_id in webhook"
      );

      return res
        .status(400)
        .send("Missing order_id");
    }

    /**
     * Fetch existing order
     */
    const existing =
      await kv.get(
        `order:${order_id}`
      );

    if (!existing) {

      console.log(
        "Order not found in KV:",
        order_id
      );

      return res
        .status(404)
        .send("Order not found");
    }

    /**
     * Safe parse KV data
     */
    const order =
      typeof existing === "string"
        ? JSON.parse(existing)
        : existing;

    /**
     * Normalize gateway status
     */
    const normalized =
      String(status || "")
        .toUpperCase();

    let paymentStatus =
      "PENDING";

    if (
      normalized === "SUCCESS" ||
      normalized === "COMPLETED" ||
      normalized === "PAID"
    ) {
      paymentStatus = "SUCCESS";
    }

    if (
      normalized === "FAILED" ||
      normalized === "FAILURE" ||
      normalized === "CANCELLED"
    ) {
      paymentStatus = "FAILED";
    }

    /**
     * Update order record
     */
    order.status =
      paymentStatus;

    order.gateway_response =
      req.body;

    order.updated_at =
      Date.now();

    /**
     * Persist update
     */
    await kv.set(
      `order:${order_id}`,
      JSON.stringify(order)
    );

    console.log(
      "ORDER UPDATED:",
      order_id,
      paymentStatus
    );

    /**
     * Acknowledge gateway
     */
    res.send(
      "Webhook processed"
    );

  } catch (err) {

    console.error(
      "WEBHOOK ERROR:",
      err
    );

    res
      .status(500)
      .send("Webhook failed");
  }
};

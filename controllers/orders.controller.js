const kv =
  require("../config/kv");

/**
 * Get single order
 */
exports.getOrder =
  async (req, res) => {

  try {

    const { order_id } =
      req.params;

    console.log(
      "Fetching order:",
      order_id
    );

    const data =
      await kv.get(
        `order:${order_id}`
      );

    if (!data) {

      return res.status(404)
        .json({
          error:
            "Order not found"
        });
    }

    /**
     * SAFE PARSE HANDLING
     * Works for both string + object
     */
    let parsed;

    if (typeof data === "string") {

      try {
        parsed =
          JSON.parse(data);
      } catch {

        parsed = data;
      }

    } else {

      parsed = data;
    }

    res.json(parsed);

  } catch (err) {

    console.error(
      "GET ORDER ERROR:",
      err
    );

    res.status(500)
      .json({
        error:
          "Failed to fetch order",
        reason:
          err.message
      });
  }
};

/**
 * Get all orders (admin)
 */
exports.getAllOrders =
  async (req, res) => {

  try {

    console.log("Fetching all orders");

    // Note: This assumes KV supports scanning or listing keys
    // If using Redis, you'd use KEYS or SCAN
    // If using a simple KV store, this might need adjustment
    
    // For now, return empty array as KV scanning implementation varies
    // You may need to implement this based on your specific KV store
    
    res.json({
      message: "Order listing not implemented for current KV store",
      orders: []
    });

  } catch (err) {

    console.error(
      "GET ALL ORDERS ERROR:",
      err
    );

    res.status(500)
      .json({
        error:
          "Failed to fetch orders",
        reason:
          err.message
      });
  }
};

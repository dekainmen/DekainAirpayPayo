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

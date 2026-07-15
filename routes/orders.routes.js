const express =
  require("express");

const router =
  express.Router();

const ordersController =
  require(
    "../controllers/orders.controller"
  );

/**
 * Get all orders (admin)
 */
router.get(
  "/",
  ordersController.getAllOrders
);

/**
 * Get single order
 */
router.get(
  "/:order_id",
  ordersController.getOrder
);

module.exports = router;

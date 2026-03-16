const kv = require("../config/kv");

/**
 * GET ALL / FILTER PRODUCTS
 */
exports.getProducts = async (req, res) => {
  try {

    const { category } = req.query;

    // Fetch products from KV
    let products =
      await kv.get("products");

    if (!products) {
      return res.json([]);
    }

    products = JSON.parse(products);

    /**
     * Category filter
     */
    if (category) {

      products =
        products.filter(p =>
          p.category
            ?.toLowerCase()
            .includes(
              category.toLowerCase()
            )
        );
    }

    res.json(products);

  } catch (err) {

    console.error(
      "PRODUCT FETCH ERROR:",
      err
    );

    res.status(500).json({
      error: "Failed to fetch products"
    });
  }
};

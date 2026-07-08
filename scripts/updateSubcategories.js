const fs = require("fs");

/**
 * Load products JSON
 */
const products =
  JSON.parse(
    fs.readFileSync(
      "./data/products.json",
      "utf8"
    )
  );

/**
 * SAME CATEGORY MAPPER
 * (Copied from your routes file)
 */
function mapCategory(product) {

  const raw = (
    product.category ||
    product.product_type ||
    product.type ||
    ""
  ).toLowerCase();

  if (
    raw.includes("wallet") ||
    raw.includes("bag") ||
    raw.includes("sunglass") ||
    raw.includes("belt")
  ) {
    return "Accessories";
  }

  if (
    raw.includes("analog watch") ||
    raw.includes("smart watch")
  ) {
    return "Watches";
  }

  if (
    raw.includes("running shoes") ||
    raw.includes("sneaker") ||
    raw.includes("casual shoes") ||
    raw.includes("flip flops") ||
    raw.includes("formal shoes")
  ) {
    return "Footwear";
  }

  if (
    raw.includes("shirts") ||
    raw.includes("t-shirts") ||
    raw.includes("jackets") ||
    raw.includes("jeans") ||
    raw.includes("sweatshirts") ||
    raw.includes("trousers") ||
    raw.includes("shorts")
  ) {
    return "Clothing";
  }

  if (
    raw.includes("nehru jackets") ||
    raw.includes("kurta")
  ) {
    return "Ethnics";
  }

  if (
    raw.includes("facecream") ||
    raw.includes("facewash") ||
    raw.includes("perfumes") ||
    raw.includes("deodrants") ||
    raw.includes("trimmers") ||
    raw.includes("shampoo")
  ) {
    return "Grooming";
  }

  return "Accessories";
}

/**
 * SUBCATEGORY CLASSIFIER
 */
function mapSubcategory(product) {

  const raw =
    product.name.toLowerCase();

  // FOOTWEAR
  if (raw.includes("sneaker"))
    return "Sneakers";

  if (raw.includes("running"))
    return "Running Shoes";

  if (raw.includes("formal"))
    return "Formal Shoes";

  if (
    raw.includes("flip flop") ||
    raw.includes("slipper")
  )
    return "Flip Flops";

  // CLOTHING
  if (raw.includes("shirt"))
    return "Shirts";

  if (raw.includes("t-shirt"))
    return "T-Shirts";

  if (raw.includes("jeans"))
    return "Jeans";

  if (raw.includes("jacket"))
    return "Jackets";

  if (raw.includes("trouser"))
    return "Trousers";

  if (raw.includes("shorts"))
    return "Shorts";

  // WATCHES
  if (raw.includes("smart watch"))
    return "Smart Watches";

  if (raw.includes("analog"))
    return "Analog Watches";

  // ACCESSORIES
  if (raw.includes("wallet"))
    return "Wallets";

  if (raw.includes("belt"))
    return "Belts";

  if (raw.includes("sunglass"))
    return "Sunglasses";

  if (raw.includes("bag"))
    return "Bags";

  // DEFAULT
  return "Other";
}

/**
 * UPDATE PRODUCTS
 */
const updatedProducts =
  products.map(p => {

    const category =
      mapCategory(p);

    const subcategory =
      mapSubcategory(p);

    return {
      ...p,
      category,
      subcategory
    };
  });

/**
 * SAVE UPDATED FILE
 */
fs.writeFileSync(
  "./data/products.json",
  JSON.stringify(
    updatedProducts,
    null,
    2
  )
);

console.log(
  "Subcategories added successfully"
);

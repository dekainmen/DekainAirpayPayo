const csv = require("csvtojson");
const fs = require("fs");
const path = require("path");

async function run() {
  const filePath = path.join(__dirname, "../data/products.csv");

  console.log("Reading CSV:", filePath);

  const rows = await csv().fromFile(filePath);

  const products = [];

  const cache = {};

  for (const row of rows) {
    const handle = row["Handle"];

    if (!handle) continue;

    if (!cache[handle]) {
      cache[handle] = {
        id: row["Variant SKU"] || "",
        name: row["Title"] || "",
        price: Number(row["Variant Price"]) || 0,
        category: row["Type"] || "Clothing",
        subcategory: "",
      };

      // Simple subcategory mapping
      const type = (row["Type"] || "").toLowerCase();

      if (type.includes("shirt"))
        cache[handle].subcategory = "Shirts";
      else if (type.includes("tshirt"))
        cache[handle].subcategory = "T-Shirts";
      else if (type.includes("jeans"))
        cache[handle].subcategory = "Jeans";
      else if (type.includes("trouser"))
        cache[handle].subcategory = "Trousers";
      else if (type.includes("short"))
        cache[handle].subcategory = "Shorts";
      else if (type.includes("sunglass"))
        cache[handle].subcategory = "Sunglasses";
      else if (type.includes("wallet"))
        cache[handle].subcategory = "Wallets";
      else if (type.includes("belt"))
        cache[handle].subcategory = "Belts";
      else if (type.includes("shoe"))
        cache[handle].subcategory = "Shoes";
      else if (type.includes("watch"))
        cache[handle].subcategory = "Watches";
      else
        cache[handle].subcategory = row["Type"] || "";
    }

    // Fill missing values from later rows if required
    if (!cache[handle].id && row["Variant SKU"])
      cache[handle].id = row["Variant SKU"];

    if (!cache[handle].name && row["Title"])
      cache[handle].name = row["Title"];

    if (!cache[handle].price && row["Variant Price"])
      cache[handle].price = Number(row["Variant Price"]);

    if (!cache[handle].category && row["Type"])
      cache[handle].category = row["Type"];

    const image = row["Image Src"];

    if (!image) continue;

    products.push({
      id:
        row["Variant SKU"] ||
        cache[handle].id ||
        "SKU_" + products.length,

      name: cache[handle].name,

      price: cache[handle].price,

      category: cache[handle].category,

      image,

      subcategory: cache[handle].subcategory
    });
  }

  fs.writeFileSync(
    path.join(__dirname, "../data/products.json"),
    JSON.stringify(products, null, 2)
  );

  console.log("Products:", products.length);
}

run();
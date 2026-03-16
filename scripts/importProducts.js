const csv = require("csvtojson");
const fs = require("fs");
const path = require("path");

async function run() {

  /**
   * Absolute-safe CSV path
   */
  const filePath =
    path.join(
      __dirname,
      "../data/products.csv"
    );

  console.log(
    "Reading CSV from:",
    filePath
  );

  /**
   * Parse CSV
   */
  const products =
    await csv().fromFile(
      filePath
    );

  /**
   * Format products
   */
  const formatted =
    products.map((p, i) => ({

      id:
        p["Variant SKU"] ||
        "SKU_" + i,

      name:
        p["Title"],

      price:
        Number(
          p["Variant Price"]
        ) || 0,

      category:
        p["Type"] ||
        "Clothing",

      image:
        p["Image Src"] ||
        "https://picsum.photos/300"

    }));

  /**
   * Save JSON
   */
  fs.writeFileSync(
    path.join(
      __dirname,
      "../data/products.json"
    ),
    JSON.stringify(
      formatted,
      null,
      2
    )
  );

  console.log(
    "Products imported:",
    formatted.length
  );
}

run();

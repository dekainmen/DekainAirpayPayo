async function loadProducts(
  category,
  subcategory
) {

  try {

    let url =
      `/api/products?category=${encodeURIComponent(category)}`;

    if (subcategory) {

      url +=
        `&subcategory=${encodeURIComponent(subcategory)}`;
    }

    console.log("FETCHING:", url);

    const res =
      await fetch(url);

    const products =
      await res.json();

    renderProducts(products);

  } catch (err) {

    console.error(
      "PRODUCT LOAD ERROR:",
      err
    );
  }
}

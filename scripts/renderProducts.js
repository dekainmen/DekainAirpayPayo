function renderProducts(products) {

  const grid =
    document.getElementById(
      "productGrid"
    );

  grid.innerHTML = "";

  if (!products.length) {

    grid.innerHTML =
      "<p>No products found</p>";

    return;
  }

  products.forEach(product => {

    const card = `
      <div class="product-card">

        <img
          src="${product.image}"
          alt="${product.name}"
        />

        <h3>
          ${product.name}
        </h3>

        <p>
          ₹${product.price}
        </p>

        <a
          href="/product.html?id=${product.id}"
        >
          View Product
        </a>

      </div>
    `;

    grid.innerHTML += card;
  });
}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const category =
      params.get("category") ||
      "Footwear";

    renderSubcategoryNavbar(
      category
    );

    loadProducts(category);
  }
);

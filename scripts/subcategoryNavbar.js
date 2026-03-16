function renderSubcategoryNavbar(
  category
) {

  const container =
    document.getElementById(
      "subcategoryNavbar"
    );

  container.innerHTML = "";

  const subs =
    CATEGORY_TREE[category] || [];

  subs.forEach(sub => {

    const btn =
      document.createElement(
        "button"
      );

    btn.innerText = sub;

    btn.onclick = () => {

      loadProducts(
        category,
        sub
      );

      document
        .querySelectorAll(
          "#subcategoryNavbar button"
        )
        .forEach(b =>
          b.classList.remove(
            "active"
          )
        );

      btn.classList.add(
        "active"
      );
    };

    container.appendChild(btn);
  });
}

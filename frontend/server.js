const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3001";
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:3002";
const APP_VERSION = process.env.APP_VERSION || "v1";

function log(message) {
  console.log(`[frontend] ${message}`);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed ${response.status}: ${text}`);
  }

  return response.json();
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NovaCart Retail</title>
  <style>
    :root {
      --bg: #f8fbff;
      --ink: #12263a;
      --brand: #0f766e;
      --brand-2: #164e63;
      --card: #ffffff;
      --muted: #5f6c7b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #e6f7ff, #f8fbff 40%, #eefaf5);
      color: var(--ink);
      min-height: 100vh;
    }
    header {
      background: linear-gradient(120deg, var(--brand), var(--brand-2));
      color: #fff;
      padding: 1rem 1.25rem;
    }
    header h1 { margin: 0; font-size: 1.4rem; }
    nav {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      flex-wrap: wrap;
    }
    button.tab {
      border: 0;
      border-radius: 8px;
      padding: 0.6rem 0.9rem;
      cursor: pointer;
      background: #dbeafe;
      color: #0b3b57;
      font-weight: 600;
    }
    button.tab.active { background: #0ea5a4; color: #fff; }
    main { padding: 1.25rem; }
    section { display: none; }
    section.active { display: block; }
    .card {
      background: var(--card);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 5px 18px rgba(18, 38, 58, 0.08);
      margin-bottom: 1rem;
    }
    .product-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.65rem 0;
      border-bottom: 1px solid #edf2f7;
    }
    .product-row:last-child { border-bottom: 0; }
    .muted { color: var(--muted); }
    .btn {
      border: 0;
      border-radius: 8px;
      background: #0f766e;
      color: #fff;
      padding: 0.45rem 0.8rem;
      cursor: pointer;
    }
    .error { color: #b91c1c; font-weight: 600; }
  </style>
</head>
<body>
  <header>
    <h1>NovaCart Retail</h1>
    <div>Simple microservices retail demo</div>
  </header>
  <nav>
    <button class="tab active" data-tab="home">Home</button>
    <button class="tab" data-tab="products">Products</button>
    <button class="tab" data-tab="cart">Cart</button>
  </nav>
  <main>
    <section id="home" class="active">
      <div class="card">
        <h2>Welcome</h2>
        <p>Browse products and add items to your cart. All data is served by backend microservices.</p>
      </div>
    </section>
    <section id="products">
      <div class="card">
        <h2>Products</h2>
        <div id="products-list" class="muted">Loading products...</div>
      </div>
    </section>
    <section id="cart">
      <div class="card">
        <h2>Cart</h2>
        <div id="cart-list" class="muted">Loading cart...</div>
      </div>
    </section>
    <div id="error" class="error"></div>
  </main>

  <script>
    const tabs = document.querySelectorAll(".tab");
    const sections = document.querySelectorAll("main section");
    const productsList = document.getElementById("products-list");
    const cartList = document.getElementById("cart-list");
    const errorEl = document.getElementById("error");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.tab;
        sections.forEach((s) => s.classList.toggle("active", s.id === target));
        if (target === "products") loadProducts();
        if (target === "cart") loadCart();
      });
    });

    function setError(message = "") { errorEl.textContent = message; }

    async function loadProducts() {
      try {
        setError("");
        const data = await fetch("/api/products").then((r) => r.json());
        if (!Array.isArray(data.products)) throw new Error("Invalid product response");
        productsList.innerHTML = data.products.map((p) =>
          '<div class="product-row">' +
            '<div>' +
              '<strong>' + p.name + '</strong>' +
              '<div class="muted">$' + p.price.toFixed(2) + '</div>' +
            '</div>' +
            '<button class="btn" onclick="addToCart(\\'' + p.id + '\\')">Add to cart</button>' +
          '</div>'
        ).join("");
      } catch (err) {
        productsList.textContent = "Unable to load products";
        setError(err.message);
      }
    }

    async function loadCart() {
      try {
        setError("");
        const data = await fetch("/api/cart").then((r) => r.json());
        if (!Array.isArray(data.items)) throw new Error("Invalid cart response");
        if (data.items.length === 0) {
          cartList.textContent = "Cart is empty";
          return;
        }
        cartList.innerHTML = data.items.map((item) =>
          '<div class="product-row">' +
            '<div>' +
              '<strong>' + item.name + '</strong>' +
              '<div class="muted">Qty: ' + item.quantity + ' | $' + item.price.toFixed(2) + '</div>' +
            '</div>' +
          '</div>'
        ).join("");
      } catch (err) {
        cartList.textContent = "Unable to load cart";
        setError(err.message);
      }
    }

    async function addToCart(productId) {
      try {
        setError("");
        const response = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId })
        });
        if (!response.ok) throw new Error("Failed to add product to cart");
        await loadCart();
      } catch (err) {
        setError(err.message);
      }
    }

    loadProducts();
  </script>
</body>
</html>`);
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await requestJson(`${PRODUCT_SERVICE_URL}/products`);
    res.json(products);
  } catch (error) {
    log(`Product API error: ${error.message}`);
    res.status(502).json({ error: "Unable to fetch products" });
  }
});

app.post("/api/cart/add", async (req, res) => {
  try {
    const payload = { productId: req.body?.productId };
    if (!payload.productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const result = await requestJson(`${CART_SERVICE_URL}/cart/add`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    res.status(201).json(result);
  } catch (error) {
    log(`Cart add API error: ${error.message}`);
    res.status(502).json({ error: "Unable to add item to cart" });
  }
});

app.get("/api/cart", async (_req, res) => {
  try {
    const cart = await requestJson(`${CART_SERVICE_URL}/cart`);
    res.json(cart);
  } catch (error) {
    log(`Cart API error: ${error.message}`);
    res.status(502).json({ error: "Unable to fetch cart" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "frontend" });
});

app.get("/version", (_req, res) => {
  res.json({ service: "frontend", version: APP_VERSION });
});

app.use((err, _req, res, _next) => {
  log(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  log(`Frontend listening on port ${PORT}`);
});

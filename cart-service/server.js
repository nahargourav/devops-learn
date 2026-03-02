const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const APP_VERSION = process.env.APP_VERSION || "v1";

const productCatalog = {
  "p-1001": { id: "p-1001", name: "Nova Wireless Mouse", price: 19.99 },
  "p-1002": { id: "p-1002", name: "Nova Mechanical Keyboard", price: 59.99 },
  "p-1003": { id: "p-1003", name: "Nova USB-C Hub", price: 29.5 },
  "p-1004": { id: "p-1004", name: "Nova 27in Monitor", price: 199.0 },
  "p-1005": { id: "p-1005", name: "Nova Noise-Cancel Headphones", price: 129.99 },
};

const cart = [];

function log(message) {
  console.log(`[cart-service] ${message}`);
}

app.post("/cart/add", (req, res) => {
  const { productId } = req.body || {};

  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }

  const product = productCatalog[productId];
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  res.status(201).json({ message: "Item added", item: productId });
});

app.get("/cart", (_req, res) => {
  res.json({ items: cart });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "cart-service" });
});

app.get("/version", (_req, res) => {
  res.json({ service: "cart-service", version: APP_VERSION });
});

app.use((err, _req, res, _next) => {
  log(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  log(`Listening on port ${PORT}`);
});
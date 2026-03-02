const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;
const APP_VERSION = process.env.APP_VERSION || "v1";

const products = [
  { id: "p-1001", name: "Nova Wireless Mouse", price: 19.99 },
  { id: "p-1002", name: "Nova Mechanical Keyboard", price: 59.99 },
  { id: "p-1003", name: "Nova USB-C Hub", price: 29.5 },
  { id: "p-1004", name: "Nova 27in Monitor", price: 199.0 },
  { id: "p-1005", name: "Nova Noise-Cancel Headphones", price: 129.99 },
];

function log(message) {
  console.log(`[product-service] ${message}`);
}

app.get("/products", (_req, res) => {
  res.json({ products });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

app.get("/version", (_req, res) => {
  res.json({ service: "product-service", version: APP_VERSION });
});

app.use((err, _req, res, _next) => {
  log(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  log(`Listening on port ${PORT}`);
});
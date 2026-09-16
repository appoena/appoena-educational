const tracer = require('dd-trace').init()
const cors = require("cors");
const express = require("express");
const { categories, products } = require("./products");

const app = express();
const port = Number(process.env.PORT || 3000);
const minLatency = Number(process.env.MIN_LATENCY_MS || 100);
const maxLatency = Number(process.env.MAX_LATENCY_MS || 1500);
const errorRate = Number(process.env.ERROR_RATE || 0.03);

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: false,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-datadog-origin",
      "x-datadog-parent-id",
      "x-datadog-sampling-priority",
      "x-datadog-trace-id",
      "traceparent",
      "tracestate",
      "baggage"
    ]
  })
);

app.use(async (_req, _res, next) => {
  const latency = randomInt(minLatency, maxLatency);
  await sleep(latency);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tea-shop-backend" });
});

app.get("/api/products", (req, res) => {
  if (req.query.search === "server-error") {
    return res.status(500).json({
      code: "SEARCH_INDEX_DOWN",
      message: "The demo search index is temporarily unavailable."
    });
  }

  if (Math.random() < errorRate) {
    return res.status(500).json({
      code: "RANDOM_PRODUCTS_FAILURE",
      message: "A controlled random product listing error happened."
    });
  }

  const search = String(req.query.search || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim();

  const filtered = products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.tastingNotes.some((note) => note.toLowerCase().includes(search));
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  res.json({
    products: filtered,
    categories,
    total: filtered.length
  });
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      code: "PRODUCT_NOT_FOUND",
      message: `Product ${req.params.id} does not exist.`
    });
  }

  res.json({ product });
});

app.post("/api/cart/validate", (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  if (items.length === 0) {
    return res.status(400).json({
      code: "EMPTY_CART",
      message: "The cart cannot be validated while empty."
    });
  }

  const normalizedItems = [];
  const warnings = [];

  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.productId);
    const quantity = Number(item.quantity || 0);

    if (!product) {
      return res.status(400).json({
        code: "INVALID_PRODUCT",
        message: `Product ${item.productId} is not available.`
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        code: "INVALID_QUANTITY",
        message: `Invalid quantity for ${product.name}.`
      });
    }

    if (quantity > product.stock) {
      warnings.push(`${product.name} has only ${product.stock} units in stock.`);
    }

    normalizedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: Math.min(quantity, product.stock)
    });
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 60 ? 0 : 5.9;
  const total = roundMoney(subtotal + shipping);

  res.json({
    ok: true,
    items: normalizedItems,
    totals: {
      subtotal: roundMoney(subtotal),
      shipping,
      total
    },
    warnings
  });
});

app.post("/api/checkout", (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const customer = req.body.customer || {};
  const payment = req.body.payment || {};

  if (items.length === 0) {
    return res.status(400).json({
      code: "EMPTY_CART",
      message: "Add at least one product before checkout."
    });
  }

  for (const field of ["name", "email", "address"]) {
    if (!String(customer[field] || "").trim()) {
      return res.status(400).json({
        code: "MISSING_CUSTOMER_FIELD",
        message: `Missing required field: ${field}.`
      });
    }
  }

  if (String(payment.method || "") === "unstable-card" || payment.forcePaymentError) {
    return res.status(402).json({
      code: "PAYMENT_DECLINED",
      message: "The demo payment processor declined this transaction."
    });
  }

  if (String(payment.cardNumber || "").replace(/\D/g, "").endsWith("0000")) {
    return res.status(402).json({
      code: "PAYMENT_DECLINED_BY_CARD",
      message: "The fake card number triggered a controlled payment failure."
    });
  }

  if (Math.random() < errorRate / 2) {
    return res.status(500).json({
      code: "CHECKOUT_GATEWAY_TIMEOUT",
      message: "The demo checkout gateway timed out."
    });
  }

  const orderItems = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return {
      productId: item.productId,
      name: product?.name || item.productId,
      quantity: Number(item.quantity || 1),
      price: Number(product?.price || 0)
    };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 60 ? 0 : 5.9;
  const total = roundMoney(subtotal + shipping);

  res.status(201).json({
    ok: true,
    order: {
      id: `TSD-${Date.now().toString(36).toUpperCase()}-${randomInt(100, 999)}`,
      createdAt: new Date().toISOString(),
      customer,
      items: orderItems,
      totals: {
        subtotal: roundMoney(subtotal),
        shipping,
        total
      },
      status: "confirmed"
    }
  });
});

app.post("/api/support", (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      code: "SUPPORT_VALIDATION_ERROR",
      message: "Name, email, subject and message are required."
    });
  }

  if (String(subject).toLowerCase().includes("erro") || String(email).includes("fail")) {
    return res.status(500).json({
      code: "SUPPORT_QUEUE_UNAVAILABLE",
      message: "The demo support queue rejected this ticket."
    });
  }

  res.status(201).json({
    ok: true,
    ticket: {
      id: `SUP-${randomInt(10000, 99999)}`,
      createdAt: new Date().toISOString(),
      status: "open"
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    code: "NOT_FOUND",
    message: `${req.method} ${req.path} is not available.`
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Tea Shop Demo API listening on http://0.0.0.0:${port}`);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

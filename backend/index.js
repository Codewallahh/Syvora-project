// backend/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./Routes/authRoute");
const userRoutes = require("./Routes/userRoute");
const itemRoutes = require("./Routes/itemRoute");

// --- Prometheus requires (require early but use after app exists)
const promClient = require('prom-client');

// Create the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Metrics setup (after app created, before routes) ---
// Collect default Node metrics (optional)
promClient.collectDefaultMetrics({ timeout: 5000 });

// Histogram for HTTP request durations
const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005,0.01,0.025,0.05,0.1,0.3,0.5,1,2,5]
});

// middleware to observe request durations and status codes
app.use((req, res, next) => {
  const route = req.route && req.route.path ? req.route.path : req.path || req.originalUrl || req.url;
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: route, code: res.statusCode });
  });
  next();
});

// expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (ex) {
    res.status(500).end(ex.toString());
  }
});
// --- end metrics setup ---

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes (register routes AFTER metrics middleware so durations are captured)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.json({ message: "API is running successfully" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


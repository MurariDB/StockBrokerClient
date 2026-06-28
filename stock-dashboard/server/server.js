/**
 * Stock Broker Dashboard - Backend Server
 * 
 * Responsibilities:
 * - Serve as WebSocket hub via Socket.IO
 * - Simulate real-time stock price fluctuations every second
 * - Manage per-user stock subscriptions
 * - Broadcast price updates only to subscribed clients
 */

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");

const app = express();
const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error connecting to MongoDB:", error));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"];

// Allow cross-origin requests from local dev and deployed frontend domains.
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/auth", authRoutes);

// ─── Supported tickers ───────────────────────────────────────────────────────
const SUPPORTED_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// ─── Initial stock prices (realistic approximate baselines) ──────────────────
let stockPrices = {
  GOOG: 1000,
  TSLA: 800,
  AMZN: 1200,
  META: 500,
  NVDA: 900,
};

/**
 * Socket.IO rooms are used to manage subscriptions.
 * Each ticker (e.g., "GOOG", "TSLA") is a room.
 * When a client subscribes, they join the room; when they unsubscribe, they leave.
 * Broadcasting to a room sends updates only to subscribed clients.
 */

// ─── Stock price simulator ────────────────────────────────────────────────────
/**
 * Generates a small realistic fluctuation (±0.5%) for a given price.
 * Uses Math.random() to decide direction and magnitude.
 */
function fluctuatePrice(currentPrice) {
  const changePercent = (Math.random() - 0.5) * 0.01; // ±0.5%
  const newPrice = currentPrice * (1 + changePercent);
  return Math.max(1, parseFloat(newPrice.toFixed(2))); // floor at $1
}

/**
 * Every second: update all stock prices, then broadcast updates to each
 * ticker room. Only clients in that room receive the price update.
 */
setInterval(() => {
  // Update every stock price
  for (const ticker of SUPPORTED_STOCKS) {
    stockPrices[ticker] = fluctuatePrice(stockPrices[ticker]);
  }

  const updatedAt = new Date().toISOString();

  // Broadcast each ticker's update to its room
  for (const ticker of SUPPORTED_STOCKS) {
    io.to(ticker).emit("stock_update", {
      [ticker]: {
        price: stockPrices[ticker],
        updatedAt,
      },
    });
  }
}, 1000);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication required."));
  }
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Invalid or expired token."));
  }
});
// ─── Socket.IO event handlers ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  /**
   * "subscribe" event: client wants to add a stock to their feed.
   * Joins the ticker room so they receive updates for that stock.
   * Payload: { ticker: "GOOG" }
   */
  socket.on("subscribe", ({ ticker }) => {
    if (!SUPPORTED_STOCKS.includes(ticker)) {
      console.warn(`[!] Unknown ticker: ${ticker} from ${socket.id}`);
      return;
    }
    socket.join(ticker);
    console.log(`[~] ${socket.id} subscribed to ${ticker}`);

    // Immediately send current price so the UI doesn't wait a full second
    socket.emit("stock_update", {
      [ticker]: {
        price: stockPrices[ticker],
        updatedAt: new Date().toISOString(),
      },
    });
  });

  /**
   * "unsubscribe" event: client removes a stock from their feed.
   * Leaves the ticker room so they stop receiving updates for that stock.
   * Payload: { ticker: "TSLA" }
   */
  socket.on("unsubscribe", ({ ticker }) => {
    socket.leave(ticker);
    console.log(`[~] ${socket.id} unsubscribed from ${ticker}`);
  });

  /**
   * "get_supported_stocks" event: client requests the list of tickers.
   * Useful on reconnection or initial load.
   */
  socket.on("get_supported_stocks", () => {
    socket.emit("supported_stocks", SUPPORTED_STOCKS);
  });

  // Cleanup on disconnect - Socket.IO automatically removes from all rooms
  socket.on("disconnect", () => {
    console.log(`[-] Client disconnected: ${socket.id}`);
  });
});

// ─── Health check endpoint ────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  const roomStats = {};
  for (const ticker of SUPPORTED_STOCKS) {
    roomStats[ticker] = io.sockets.adapter.rooms.get(ticker)?.size || 0;
  }
  res.json({
    status: "ok",
    connectedClients: io.sockets.sockets.size,
    subscriptionsByTicker: roomStats,
    currentPrices: stockPrices,
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 Stock Dashboard Server running on http://localhost:${PORT}`);
  console.log(`   Streaming: ${SUPPORTED_STOCKS.join(", ")}\n`);
});
 
/**
 * Stock Broker Dashboard - Backend Server
 * 
 * Responsibilities:
 * - Serve as WebSocket hub via Socket.IO
 * - Simulate real-time stock price fluctuations every second
 * - Manage per-user stock subscriptions
 * - Broadcast price updates only to subscribed clients
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Allow cross-origin requests from React dev server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

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
 * userSubscriptions maps socket.id → Set of subscribed ticker symbols.
 * Each user independently tracks which stocks they want live updates for.
 */
const userSubscriptions = {};

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
 * Every second: update all stock prices, then push only the relevant
 * stocks to each connected socket based on their subscriptions.
 */
setInterval(() => {
  // Update every stock price
  for (const ticker of SUPPORTED_STOCKS) {
    stockPrices[ticker] = fluctuatePrice(stockPrices[ticker]);
  }

  const updatedAt = new Date().toISOString();

  // For each connected socket, send only their subscribed stocks
  for (const [socketId, subscriptions] of Object.entries(userSubscriptions)) {
    if (subscriptions.size === 0) continue;

    const payload = {};
    for (const ticker of subscriptions) {
      payload[ticker] = {
        price: stockPrices[ticker],
        updatedAt,
      };
    }

    // Emit directly to this specific socket
    io.to(socketId).emit("stock_update", payload);
  }
}, 1000);

// ─── Socket.IO event handlers ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  // Initialize an empty subscription set for this socket
  userSubscriptions[socket.id] = new Set();

  /**
   * "subscribe" event: client wants to add a stock to their feed.
   * Payload: { ticker: "GOOG" }
   */
  socket.on("subscribe", ({ ticker }) => {
    if (!SUPPORTED_STOCKS.includes(ticker)) {
      console.warn(`[!] Unknown ticker: ${ticker} from ${socket.id}`);
      return;
    }
    userSubscriptions[socket.id].add(ticker);
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
   * Payload: { ticker: "TSLA" }
   */
  socket.on("unsubscribe", ({ ticker }) => {
    userSubscriptions[socket.id]?.delete(ticker);
    console.log(`[~] ${socket.id} unsubscribed from ${ticker}`);
  });

  /**
   * "get_supported_stocks" event: client requests the list of tickers.
   * Useful on reconnection or initial load.
   */
  socket.on("get_supported_stocks", () => {
    socket.emit("supported_stocks", SUPPORTED_STOCKS);
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    delete userSubscriptions[socket.id];
    console.log(`[-] Client disconnected: ${socket.id}`);
  });
});

// ─── Health check endpoint ────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connectedClients: Object.keys(userSubscriptions).length,
    currentPrices: stockPrices,
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 Stock Dashboard Server running on http://localhost:${PORT}`);
  console.log(`   Streaming: ${SUPPORTED_STOCKS.join(", ")}\n`);
});

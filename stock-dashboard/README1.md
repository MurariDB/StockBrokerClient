# StockPulse

Real-time stock dashboard built with React, Node.js, Express, and Socket.IO.

Users can log in using an email address, subscribe to supported stock tickers, and receive live stock price updates without refreshing the page. Stock prices are simulated on the server and broadcast to connected clients every second.

---

## Assignment Requirements

| Requirement                        | Status |
| ---------------------------------- | ------ |
| Email-based login                  | ✅      |
| Support 5 stock tickers            | ✅      |
| Subscribe to stocks                | ✅      |
| Real-time updates without refresh  | ✅      |
| Random stock price generation      | ✅      |
| Multiple users supported           | ✅      |
| Independent subscriptions per user | ✅      |
| Asynchronous dashboard updates     | ✅      |

---

## Features

### Core Features

* Email-based login
* Subscribe and unsubscribe from supported stocks
* Live stock price updates using Socket.IO
* Real-time dashboard updates without page refresh
* Support for multiple concurrent users
* Independent watchlists for each user
* Simulated stock market with automatic price updates every second

### Additional Features

* Compact sparkline charts for each stock
* Watchlist statistics

  * Total subscribed stocks
  * Average stock price
  * Highest priced stock
  * Lowest priced stock
* Dark / Light mode toggle
* Responsive user interface
* Persistent watchlists using localStorage
* Persistent theme preferences

---

## Supported Stocks

The application supports the following stock tickers:

* GOOG
* TSLA
* AMZN
* META
* NVDA

---

## Tech Stack

### Frontend

* React
* Vite
* Socket.IO Client
* CSS3

### Backend

* Node.js
* Express.js
* Socket.IO

### Storage

* Browser localStorage (user watchlists and theme preferences)

---

## Architecture

```text
React Client (Vite)
        │
        │ Socket.IO
        ▼
Node.js + Express Server
        │
        ▼
Stock Price Simulator
(Random Updates Every Second)
```

### How It Works

1. Users log in using an email address.
2. Users select stocks to add to their watchlist.
3. The server generates updated stock prices every second.
4. Socket.IO broadcasts updates to all connected clients.
5. The dashboard updates automatically without refreshing the browser.
6. Each user only sees stocks from their own watchlist.

---

## Installation

### Prerequisites

* Node.js 18+
* npm

### Install Backend Dependencies

```bash
cd stock-dashboard/server
npm install
```

### Install Frontend Dependencies

```bash
cd stock-dashboard/client
npm install
```

---

## Running the Application

### Start Backend Server

```bash
cd stock-dashboard/server
npm start
```

Backend runs on:

```text
http://localhost:4000
```

### Start Frontend

```bash
cd stock-dashboard/client
npm run start
```

Frontend typically runs on:

```text
http://localhost:5173
```

If port 5173 is occupied, Vite will automatically use the next available port.

---

## Run Both Frontend and Backend

From the project root:

```bash
npm run dev
```

This starts both services concurrently for local development.

---

## Multi-User Verification

The application supports multiple users simultaneously.

### Example

**User A**

* GOOG
* TSLA

**User B**

* META
* NVDA

Both users receive live stock updates at the same time while only viewing their own selected stocks.

---

## Design Decisions

### Socket.IO for Real-Time Updates

Socket.IO was chosen to provide low-latency real-time communication between the server and connected clients. This allows stock prices to update instantly without page refreshes or polling.

### Simulated Stock Market

To satisfy assignment requirements, stock prices are generated on the server using a random price simulation and updated every second.

### User-Specific Watchlists

Watchlists are stored in localStorage and keyed by email, allowing different users to maintain separate subscriptions on the same application.

### Lightweight Price Visualization

Sparkline charts display recent stock movement using a rolling history of price updates, providing quick visual insight without requiring a full charting solution.

---

## Project Structure

```text
stock-dashboard/

├── server/
│   ├── server.js
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── App.full.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## Screenshots

### Login Page

User enters an email address to access the application.

![Login Page](screenshots/login-page.png)

### Stock Selection Page

Users choose stocks to subscribe to from the supported ticker list.

![Stock Selection Page](screenshots/stock-selection-page.png)

### Live Dashboard

Displays:

* Real-time stock prices
* Sparkline charts
* Watchlist statistics
* Price movement indicators
* Theme controls

![Live Dashboard](screenshots/live-dashboard-page.png)

---

## Troubleshooting

### Frontend Not Loading

Ensure the Vite development server is running and note the port shown in the terminal.

### Socket Connection Issues

Verify that:

* The backend server is running on port `4000`
* Socket.IO is configured correctly
* No firewall or port conflicts exist

### Port Already in Use

If you encounter an `EADDRINUSE` error, stop the process currently using the port or configure a different port.

---

## Notes

* No external stock APIs are used.
* Stock prices are simulated and generated entirely on the backend.
* The application was built to satisfy the assignment requirements while demonstrating real-time communication, state management, and multi-user support.

---

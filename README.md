# StockPulse - Real-Time Stock Broker Client Dashboard

A real-time stock dashboard built using React, Node.js, Express, and Socket.IO. Users can subscribe to stock tickers and receive live price updates without refreshing the page.

## Assignment Requirements Coverage

| Requirement                            | Status |
| -------------------------------------- | ------ |
| Email-based login                      | ✅      |
| Support 5 stock tickers                | ✅      |
| Subscribe to stocks                    | ✅      |
| Real-time updates without page refresh | ✅      |
| Random stock price generation          | ✅      |
| Multiple users supported               | ✅      |
| Independent subscriptions per user     | ✅      |
| Asynchronous live updates              | ✅      |

---

## Features

* Email-based user login
* Subscribe/unsubscribe to stocks
* Real-time stock price updates using Socket.IO
* Support for multiple concurrent users
* Independent watchlists per user
* Automatic stock price simulation every second
* Live market feed dashboard
* Watchlist statistics
* Sparkline price trend visualization
* Dark/Light mode toggle
* Responsive user interface
* Local storage persistence

---

## Supported Stocks

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
* CSS

### Backend

* Node.js
* Express.js
* Socket.IO

---

## Architecture

```text
React Client
      │
      │ Socket.IO
      ▼
Node.js + Express Server
      │
      ▼
Stock Price Simulator
(Random Updates Every Second)
```

### Workflow

1. User logs in using an email address.
2. User selects stocks to subscribe to.
3. Server generates random stock price updates every second.
4. Socket.IO broadcasts updates to connected clients.
5. Dashboard updates in real time without refreshing.
6. Each user sees only their subscribed stocks.

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd stock-dashboard
```

### Install Dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

---

## Running the Application

### Start Backend

```bash
cd server
npm start
```

Runs on:

```text
http://localhost:4000
```

### Start Frontend

```bash
cd client
npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

## Multi-User Support

The application supports multiple simultaneous users.

Example:

**User A**

* GOOG
* TSLA

**User B**

* META
* NVDA

Both users receive live updates independently while maintaining separate watchlists.

---

## Design Decisions

### Socket.IO

Used to provide efficient real-time communication without polling.

### Server-Side Stock Simulation

Stock prices are generated and updated on the server every second to satisfy assignment requirements.

### User-Specific Watchlists

Each user maintains an independent subscription list.

### Lightweight Visualization

Sparkline charts provide quick trend insights without requiring complex analytics infrastructure.

---

## Project Structure

```text
stock-dashboard/
│
├── client/
│   ├── src/
│   └── package.json
│
├── server/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Screenshots

### Login Page

User authentication using email login.
screenshots/login.png

### Stock Selection

Select supported stocks to subscribe.
screenshots/stock-selection.png

### Live Dashboard

* Real-time stock prices
* Watchlist statistics
* Sparkline charts
* Theme controls
* Live market feed
screenshots/dashboard.png
---

## Notes

* No external stock APIs are used.
* Prices are simulated for demonstration purposes.
* Built as part of a Stock Broker Client Dashboard assignment to demonstrate real-time web application development using Socket.IO.

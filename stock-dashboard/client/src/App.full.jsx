import React, { useState, useEffect, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import Login from "./components/Login";
import StockSelector from "./components/StockSelector";
import Dashboard from "./components/Dashboard";
import "./App.css";

const SOCKET_SERVER = import.meta.env.VITE_SOCKET_SERVER || "http://localhost:4000";
const SUPPORTED_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

function App() {
  const [email, setEmail] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [stockData, setStockData] = useState({});
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });
  const [step, setStep] = useState("login");

  function persistSubscriptionsFor(emailKey, subsSet) {
    if (!emailKey) return;
    try {
      const arr = Array.from(subsSet || []);
      localStorage.setItem(`subs:${emailKey}`, JSON.stringify(arr));
    } catch (err) {}
  }

  // Theme effect
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch (err) {}
  }, [theme]);

  // Socket effect — runs when email changes
  useEffect(() => {
    if (!email) return;

    const token = localStorage.getItem("token"); // get JWT token
    const newSocket = io(SOCKET_SERVER, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      auth: { token }, // send token with connection
    });

    newSocket.on("connect", () => {
      setConnected(true);
      try {
        const raw = localStorage.getItem(`subs:${email}`);
        if (raw) {
          const arr = JSON.parse(raw || "[]");
          setSubscriptions(new Set(arr));
          arr.forEach((t) => newSocket.emit("subscribe", { ticker: t }));
        }
      } catch (e) {}
    });

    newSocket.on("disconnect", () => setConnected(false));

    newSocket.on("stock_update", (payload) => {
      setStockData((prev) => {
        const next = { ...prev };
        Object.entries(payload).forEach(([ticker, incoming]) => {
          const existing = prev[ticker] || { history: [] };
          const history = [
            ...(Array.isArray(existing.history) ? existing.history : []),
            { price: incoming.price, updatedAt: incoming.updatedAt },
          ].slice(-20);
          next[ticker] = { ...existing, ...incoming, history };
        });
        return next;
      });
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [email]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const handleLogin = useCallback((userEmail) => {
    setEmail(userEmail);
    try {
      const raw = localStorage.getItem(`subs:${userEmail}`);
      if (raw) setSubscriptions(new Set(JSON.parse(raw || "[]")));
    } catch (e) {}
    setStep("select");
  }, []);

  const handleToggleSubscription = useCallback(
    (ticker) => {
      if (!socket) return;
      setSubscriptions((prev) => {
        const next = new Set(prev);
        if (next.has(ticker)) {
          next.delete(ticker);
          socket.emit("unsubscribe", { ticker });
          setStockData((d) => {
            const copy = { ...d };
            delete copy[ticker];
            return copy;
          });
        } else {
          next.add(ticker);
          socket.emit("subscribe", { ticker });
        }
        persistSubscriptionsFor(email, next);
        return next;
      });
    },
    [socket, email]
  );

  const handleGoToDashboard = useCallback(() => setStep("dashboard"), []);
  const handleEditSubscriptions = useCallback(() => setStep("select"), []);
  const handleLogout = useCallback(() => {
    setEmail(null);
    setSubscriptions(new Set());
    setStockData({});
    setStep("login");
  }, []);

  const watchlistStats = useMemo(() => {
    const tickers = Array.from(subscriptions);
    const priced = tickers
      .map((ticker) => ({ ticker, price: stockData[ticker]?.price }))
      .filter((item) => typeof item.price === "number");
    const average = priced.length
      ? priced.reduce((sum, item) => sum + item.price, 0) / priced.length
      : 0;
    const sorted = priced.slice().sort((a, b) => b.price - a.price);
    return {
      count: tickers.length,
      average,
      highest: sorted[0] || null,
      lowest: sorted[sorted.length - 1] || null,
    };
  }, [subscriptions, stockData]);

  return (
    <div className="app-shell">
      {email && (
        <header className="top-bar">
          <div className="top-bar__brand">
            <span className="top-bar__dot" />
            <span className="top-bar__name">StockPulse</span>
          </div>
          <div className="top-bar__right">
            <ConnectionBadge connected={connected} />
            <span className="top-bar__email">{email}</span>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
          </div>
        </header>
      )}
      <main className="app-main">
        {step === "login" && <Login onLogin={handleLogin} />}
        {step === "select" && (
          <StockSelector
            stocks={SUPPORTED_STOCKS}
            subscriptions={subscriptions}
            onToggle={handleToggleSubscription}
            onContinue={handleGoToDashboard}
            connected={connected}
          />
        )}
        {step === "dashboard" && (
          <Dashboard
            email={email}
            subscriptions={subscriptions}
            stockData={stockData}
            stats={watchlistStats}
            connected={connected}
            onEditSubscriptions={handleEditSubscriptions}
          />
        )}
      </main>
    </div>
  );
}

function ConnectionBadge({ connected }) {
  return (
    <span className={`conn-badge ${connected ? "conn-badge--on" : "conn-badge--off"}`}>
      <span className="conn-badge__dot" />
      {connected ? "Live" : "Reconnecting…"}
    </span>
  );
}

export default App;
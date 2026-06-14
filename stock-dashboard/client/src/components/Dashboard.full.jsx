// Copied Dashboard.jsx
import React, { useRef, useEffect, useState } from "react";

const STOCK_META = {
  GOOG: { name: "Alphabet",  color: "#4285F4" },
  TSLA: { name: "Tesla",     color: "#E31937" },
  AMZN: { name: "Amazon",    color: "#FF9900" },
  META: { name: "Meta",      color: "#0866FF" },
  NVDA: { name: "NVIDIA",    color: "#76B900" },
};

function Dashboard({ email, subscriptions, stockData, connected, onEditSubscriptions, stats }) {
  const subscribedList = Array.from(subscriptions);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Live Market Feed</h2>
          <p className="dashboard-sub">
            Watching <strong>{subscribedList.length}</strong> stock{subscribedList.length !== 1 ? "s" : ""}
            {!connected && <span className="dash-offline"> — reconnecting…</span>}
          </p>
        </div>
        <button className="btn-outline" onClick={onEditSubscriptions}>
          Edit watchlist
        </button>
      </div>

        <div className="dashboard-panels">
          <div className="watchlist-stats">
            <div className="stats-card">
              <div className="stats-card__title">Watchlist Statistics</div>
              <div className="stats-card__row">
                <span>Subscribed Stocks</span>
                <strong>{stats.count}</strong>
              </div>
              <div className="stats-card__row">
                <span>Average Price</span>
                <strong>{stats.count ? `₹${Math.round(stats.average)}` : "—"}</strong>
              </div>
              <div className="stats-card__row">
                <span>Highest</span>
                <strong>{stats.highest ? `${stats.highest.ticker} ₹${stats.highest.price.toFixed(2)}` : "—"}</strong>
              </div>
              <div className="stats-card__row">
                <span>Lowest</span>
                <strong>{stats.lowest ? `${stats.lowest.ticker} ₹${stats.lowest.lowest?.price?.toFixed(2) || stats.lowest?.price?.toFixed(2)}` : "—"}</strong>
              </div>
            </div>
          </div>
        </div>

      {subscribedList.length === 0 ? (
        <div className="dashboard-empty">
          <p>No stocks selected.</p>
          <button className="btn-cta-sm" onClick={onEditSubscriptions}>
            Add stocks →
          </button>
        </div>
      ) : (
        <div className="price-grid">
          {subscribedList.map((ticker) => (
            <PriceCard
              key={ticker}
              ticker={ticker}
              data={stockData[ticker]}
            />
          ))}
        </div>
      )}

      {subscribedList.length > 0 && (
        <div className="ticker-tape" aria-hidden="true">
          <div className="ticker-tape__inner">
            {[...subscribedList, ...subscribedList].map((ticker, i) => (
              <span key={i} className="ticker-tape__item">
                <span className="ticker-tape__symbol">{ticker}</span>
                <span className="ticker-tape__price">
                  {stockData[ticker] ? `$${stockData[ticker].price.toFixed(2)}` : "—"}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PriceCard({ ticker, data }) {
  const meta = STOCK_META[ticker] || {};
  const prevPriceRef = useRef(null);
  const [flash, setFlash] = useState(null);

  const price = data?.price ?? null;
  const updatedAt = data?.updatedAt ?? null;
  const history = Array.isArray(data?.history) ? data.history : [];

  useEffect(() => {
    if (price === null) return;

    if (prevPriceRef.current !== null) {
      const direction = price > prevPriceRef.current ? "up" : price < prevPriceRef.current ? "down" : null;
      if (direction) {
        setFlash(direction);
        const t = setTimeout(() => setFlash(null), 650);
        return () => clearTimeout(t);
      }
    }
    prevPriceRef.current = price;
  }, [price]);

  const initialPrice = history.length > 0 ? history[0].price : price;
  const change = initialPrice && price
    ? ((price - initialPrice) / initialPrice) * 100
    : null;

  const timeStr = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div
      className={`price-card ${flash ? `price-card--flash-${flash}` : ""}`}
      style={{ "--card-accent": meta.color }}
    >
      <div className="price-card__top">
        <div className="price-card__ticker">{ticker}</div>
        {change !== null && (
          <span className={`price-card__dir ${change >= 0 ? "dir--up" : "dir--down"}`}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>

      <div className="price-card__name">{meta.name}</div>

      <div className="price-card__price">
        {price !== null ? (
          <>
            <span className="price-card__dollar">$</span>
            {price.toFixed(2)}
          </>
        ) : (
          <span className="price-card__loading">Connecting…</span>
        )}
      </div>

      <div className="price-card__time">
        {timeStr ? `Updated ${timeStr}` : "Waiting for data…"}
      </div>

      <StockSparkline points={history} accent={meta.color} direction={change} />
      <div className="price-card__bar" />
    </div>
  );
}

function StockSparkline({ points, accent, direction }) {
  const values = points.map((item) => item.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 220;
  const height = 88;
  const margin = 12;
  const stepX = points.length > 1 ? (width - margin * 2) / (points.length - 1) : 0;
  const color = direction >= 0 ? accent : "#ff7588";

  if (points.length < 2) {
    return <div className="price-card__chart-placeholder">Waiting for more ticks to draw the chart…</div>;
  }

  const pathData = points
    .map((item, index) => {
      const x = margin + index * stepX;
      const y = height - margin - ((item.price - min) / range) * (height - margin * 2);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  const fillPath = `${pathData} L ${width - margin} ${height - margin} L ${margin} ${height - margin} Z`;

  return (
    <div className="price-card__chart">
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <g className="price-card__chart-grid">
          {[1, 2, 3].map((index) => (
            <line
              key={index}
              x1={margin}
              x2={width - margin}
              y1={margin + ((height - margin * 2) / 4) * index}
              y2={margin + ((height - margin * 2) / 4) * index}
            />
          ))}
        </g>
        <path d={fillPath} className="price-card__chart-fill" fill={accent} />
        <path d={pathData} className="price-card__chart-path" stroke={color} />
      </svg>
    </div>
  );
}

export default Dashboard;

// Copied StockSelector.jsx
import React from "react";

const STOCK_META = {
  GOOG: { name: "Alphabet",  sector: "Tech",    color: "#4285F4" },
  TSLA: { name: "Tesla",     sector: "EV",      color: "#E31937" },
  AMZN: { name: "Amazon",    sector: "E-Comm",  color: "#FF9900" },
  META: { name: "Meta",      sector: "Social",  color: "#0866FF" },
  NVDA: { name: "NVIDIA",    sector: "Semicon", color: "#76B900" },
};

function StockSelector({ stocks, subscriptions, onToggle, onContinue, connected }) {
  const count = subscriptions.size;

  return (
    <div className="selector-page">
      <div className="selector-container">
        <header className="selector-header">
          <h2 className="selector-title">Choose your watchlist</h2>
          <p className="selector-desc">
            Select the stocks you want to follow. You can change these at any time.
          </p>
        </header>

        {!connected && (
          <div className="selector-notice">
            ⚠ Connecting to server… subscriptions will apply once connected.
          </div>
        )}

        <div className="stock-grid">
          {stocks.map((ticker) => {
            const meta = STOCK_META[ticker];
            const active = subscriptions.has(ticker);

            return (
              <button
                key={ticker}
                className={`stock-card ${active ? "stock-card--active" : ""}`}
                onClick={() => onToggle(ticker)}
                style={{ "--card-accent": meta.color }}
                aria-pressed={active}
              >
                <div className="stock-card__head">
                  <div className="stock-card__ticker">{ticker}</div>
                  <div className={`stock-card__check ${active ? "stock-card__check--on" : ""}`}>
                    {active ? "✓" : "+"}
                  </div>
                </div>
                <div className="stock-card__name">{meta.name}</div>
                <div className="stock-card__sector">{meta.sector}</div>
              </button>
            );
          })}
        </div>

        <div className="selector-cta">
          <span className="selector-count">
            {count === 0
              ? "Select at least one stock"
              : `${count} stock${count > 1 ? "s" : ""} selected`}
          </span>
          <button
            className="btn-cta"
            onClick={onContinue}
            disabled={count === 0}
          >
            View live dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockSelector;

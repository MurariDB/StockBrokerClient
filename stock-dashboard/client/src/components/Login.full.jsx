// Copied Login.jsx

import React, { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("That doesn't look like a valid email.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      onLogin(trimmed);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand__icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline
                points="4,30 12,18 20,24 28,10 36,16"
                stroke="var(--cyan)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="36" cy="16" r="3" fill="var(--cyan)" />
            </svg>
          </div>
          <h1 className="login-brand__title">StockPulse</h1>
          <p className="login-brand__sub">Real-time market data dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className={`form-input ${error ? "form-input--error" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              "Enter dashboard →"
            )}
          </button>
        </form>

        <p className="login-footer">
          No password needed — just your email to identify your session.
        </p>
      </div>

      <div className="login-bg" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="login-bg__bar" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>
    </div>
  );
}

export default Login;

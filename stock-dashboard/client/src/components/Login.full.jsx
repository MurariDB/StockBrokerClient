import React, { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("That doesn't look like a valid email.");
      return;
    }
    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      // Store JWT token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);

      onLogin(data.email);

    } catch (err) {
      setError("Could not connect to server. Please try again.");
      setLoading(false);
    }
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
              onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={`form-input ${error ? "form-input--error" : ""}`}
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
              autoComplete={isRegister ? "new-password" : "current-password"}
              disabled={loading}
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              isRegister ? "Create account →" : "Enter dashboard →"
            )}
          </button>
        </form>

        <p className="login-footer">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button
            className="btn-link"
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
          >
            {isRegister ? "Sign in" : "Register"}
          </button>
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
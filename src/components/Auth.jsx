import { useState } from "react";

export default function Auth({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const err = await onSignIn(email, password);
      if (err) setError(err.message);
    } else {
      const err = await onSignUp(email, password);
      if (err) setError(err.message);
      else setSuccess("Check your email for a confirmation link.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">ezLog</div>
      <div className="auth-tagline">Track every rep. Own every PR.</div>

      <div style={{ width: "100%" }}>
        <div className="pill-tabs">
          <button className={`pill-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Log In</button>
          <button className={`pill-tab ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          {success && (
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "var(--green)", fontFamily: "var(--font-body)", fontSize: 13, borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 12 }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            className="btn-amber"
            type="submit"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, marginTop: 8 }}
          >
            {loading ? "…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

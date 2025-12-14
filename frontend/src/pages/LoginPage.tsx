import "../styles/pages/login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const nav = useNavigate();
  const { setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      setSession(res.token, res.user);
      nav("/menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Close button */}
      <button 
        className="auth-close" 
        onClick={() => nav("/")}
        aria-label="Close"
      >
        ×
      </button>

      {/* Left side - Login form */}
      <div className="auth-form-wrapper">
        <h1 className="auth-title">Member Login</h1>

        <form onSubmit={onSubmit} className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Type Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Type Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account? </span>
          <Link to="/register">Register</Link>
        </div>

        {error && <div className="auth-error">{error}</div>}
      </div>

      {/* Right side - Restaurant branding */}
      <div className="auth-branding">
        <h2>Quick Service<br />Restaurant</h2>
        <p>Your Perfect Place for<br />Delicious Foods</p>
      </div>
    </div>
  );
}
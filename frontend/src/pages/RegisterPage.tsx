import "../styles/pages/login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, Number(phone), email, password);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        nav("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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

      {/* Left side - Register form */}
      <div className="auth-form-wrapper">
        <h1 className="auth-title">Member Register</h1>

        <form onSubmit={onSubmit} className="auth-form">
          <input
            className="auth-input"
            type="text"
            placeholder="Type Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          <input
            className="auth-input"
            type="tel"
            placeholder="Type Your Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
          />

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
            autoComplete="new-password"
            required
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
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
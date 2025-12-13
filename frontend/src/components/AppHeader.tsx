import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/components/AppHeader.css";

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Don't show header on login/register pages
  const hideHeader = ["/login", "/register"].includes(location.pathname);
  
  if (hideHeader) {
    return null;
  }

  // Show back button on checkout and success pages
  const showBackButton = ["/checkout", "/order-success"].includes(location.pathname);

  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="header-left">
          {showBackButton && (
            <button className="back-btn" onClick={() => navigate("/menu")}>
              ← Back to Menu
            </button>
          )}
          <div className="app-logo">
            <h1>Quick Service Restaurant</h1>
            <p>Your Perfect Place for Delicious Foods</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">Welcome, {user?.email}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
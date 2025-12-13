import { useAuth } from "../context/AuthContext";

export function MenuHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="menu-header">
      <div className="menu-header-content">
        <div className="menu-logo">
          <h1>Quick Service Restaurant</h1>
          <p>Your Perfect Place for Delicious Foods</p>
        </div>
        <div className="menu-user-section">
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
import { useAuth } from "../context/AuthContext";

export function MenuPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>Menu</h1>
      <p>Logged in as: {user?.email} ({user?.role})</p>
      <button onClick={logout}>Logout</button>

      <p style={{ marginTop: 20 }}>
        Next: fetch menu from backend and build cart.
      </p>
    </div>
  );
}

import "../styles/pages/menu.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMenuItems } from "../api/menu";
import type {MenuItem} from "../types/menuItem"

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export function MenuPage() {
  const { user, logout } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"ALL" | "BURGER" | "DRINK">("ALL");

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((ci) => ci.menuItem.id === item.id);
      if (existingItem) {
        return prevCart.map((ci) =>
          ci.menuItem.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((ci) => ci.menuItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((ci) =>
          ci.menuItem.id === itemId
            ? { ...ci, quantity: ci.quantity - 1 }
            : ci
        );
      }
      return prevCart.filter((ci) => ci.menuItem.id !== itemId);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory === "ALL") return true;
    return item.type === activeCategory;
  });

  const burgers = menuItems.filter((item) => item.type === "BURGER");
  const drinks = menuItems.filter((item) => item.type === "DRINK");

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Header */}
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

      <div className="menu-container">
        {/* Sidebar - Cart */}
        <aside className="cart-sidebar">
          <div className="cart-header">
            <h2>Your Order</h2>
            <span className="cart-count">{getCartItemCount()} items</span>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <p className="cart-empty-hint">Add items from the menu</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.menuItem.name}</h4>
                      {item.menuItem.size && (
                        <span className="cart-item-size">({item.menuItem.size})</span>
                      )}
                      <p className="cart-item-price">${item.menuItem.price.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="cart-btn cart-btn-minus"
                        onClick={() => removeFromCart(item.menuItem.id)}
                      >
                        −
                      </button>
                      <span className="cart-item-quantity">{item.quantity}</span>
                      <button
                        className="cart-btn cart-btn-plus"
                        onClick={() => addToCart(item.menuItem)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="cart-total-price">${getCartTotal().toFixed(2)}</span>
                </div>
                <button className="cart-clear-btn" onClick={clearCart}>
                  Clear Cart
                </button>
                <button className="cart-checkout-btn">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Main Content - Menu */}
        <main className="menu-main">
          {error && <div className="menu-error">{error}</div>}

          {/* Category Filter */}
          <div className="category-filter">
            <button
              className={`category-btn ${activeCategory === "ALL" ? "active" : ""}`}
              onClick={() => setActiveCategory("ALL")}
            >
              All Items ({menuItems.length})
            </button>
            <button
              className={`category-btn ${activeCategory === "BURGER" ? "active" : ""}`}
              onClick={() => setActiveCategory("BURGER")}
            >
              Burgers ({burgers.length})
            </button>
            <button
              className={`category-btn ${activeCategory === "DRINK" ? "active" : ""}`}
              onClick={() => setActiveCategory("DRINK")}
            >
              Drinks ({drinks.length})
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-item-card">
                <div className="menu-item-header">
                  <h3 className="menu-item-name">{item.name}</h3>
                  {item.size && (
                    <span className="menu-item-size-badge">{item.size}</span>
                  )}
                </div>
                <div className="menu-item-type">
                  {item.type === "BURGER" ? "🍔 Burger" : "🥤 Drink"}
                </div>
                <div className="menu-item-footer">
                  <span className="menu-item-price">${item.price.toFixed(2)}</span>
                  <button
                    className="menu-item-add-btn"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="no-items">
              <p>No items found in this category</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
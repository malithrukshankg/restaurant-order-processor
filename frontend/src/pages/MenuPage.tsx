import "../styles/pages/menu.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMenuItems } from "../api/menu";
import type { MenuItem } from "../types/menuItem";
import type { CartItem } from "../types/cart";
import { CartSidebar } from "../components/CartSidebar";
import { CategoryFilter } from "../components/CategoryFilter";
import { MenuGrid } from "../components/MenuGrid";

export function MenuPage() {
  const nav = useNavigate();
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

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    
    // Navigate to checkout and clear cart after successful order
    nav("/checkout", { 
      state: { 
        cart, 
        total 
      } 
    });
    
    // Clear cart after navigating
    clearCart();
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
      <div className="menu-container">
        <CartSidebar
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
        />

        <main className="menu-main">
          {error && <div className="menu-error">{error}</div>}

          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            totalItems={menuItems.length}
            burgerCount={burgers.length}
            drinkCount={drinks.length}
          />

          <MenuGrid items={filteredItems} onAddToCart={addToCart} />
        </main>
      </div>
    </div>
  );
}
import "../styles/pages/menu.css";
import { useEffect, useState } from "react";
import { getMenuItems } from "../api/menu";
import type { MenuItem } from "../types/menuItem";
import { MenuHeader } from "../components/MenuHeader";
import { CartSidebar } from "../components/CartSidebar";
import { CategoryFilter } from "../components/CategoryFilter";
import { MenuGrid } from "../components/MenuGrid";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export function MenuPage() {
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
    // TODO: Implement checkout logic
    console.log("Proceeding to checkout with cart:", cart);
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
      <MenuHeader />

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
import type { MenuItem } from "../types/menuItem";
import { MenuItemCard } from "./MenuItemCard";

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

export function MenuGrid({ items, onAddToCart }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="no-items">
        <p>No items found in this category</p>
      </div>
    );
  }

  return (
    <div className="menu-grid">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
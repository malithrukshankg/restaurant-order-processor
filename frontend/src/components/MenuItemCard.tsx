import type { MenuItem } from "../types/menuItem";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <div className="menu-item-card">
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
          onClick={() => onAddToCart(item)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
import type { MenuItem } from "../types/menuItem";

interface CartItemProps {
  item: MenuItem;
  quantity: number;
  onIncrease: (item: MenuItem) => void;
  onDecrease: (itemId: number) => void;
}

export function CartItem({ item, quantity, onIncrease, onDecrease }: CartItemProps) {
  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        {item.size && (
          <span className="cart-item-size">({item.size})</span>
        )}
        <p className="cart-item-price">${item.price.toFixed(2)}</p>
      </div>
      <div className="cart-item-controls">
        <button
          className="cart-btn cart-btn-minus"
          onClick={() => onDecrease(item.id)}
        >
          −
        </button>
        <span className="cart-item-quantity">{quantity}</span>
        <button
          className="cart-btn cart-btn-plus"
          onClick={() => onIncrease(item)}
        >
          +
        </button>
      </div>
    </div>
  );
}
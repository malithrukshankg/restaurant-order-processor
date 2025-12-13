import type { MenuItem } from "../types/menuItem";
import type { CartItem } from "../types/cart";
import { CartItem as CartItemComponent } from "./CartItem";

interface CartSidebarProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartSidebar({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
}: CartSidebarProps) {
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
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
              <CartItemComponent
                key={item.menuItem.id}
                item={item.menuItem}
                quantity={item.quantity}
                onIncrease={onAddToCart}
                onDecrease={onRemoveFromCart}
              />
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span className="cart-total-price">${getCartTotal().toFixed(2)}</span>
            </div>
            <button className="cart-clear-btn" onClick={onClearCart}>
              Clear Cart
            </button>
            <button className="cart-checkout-btn" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
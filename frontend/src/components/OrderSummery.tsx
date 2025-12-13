import type { CartItem } from "../types/cart";

interface OrderSummaryProps {
  cart: CartItem[];
  total: number;
}

export function OrderSummary({ cart, total }: OrderSummaryProps) {
  const GST_RATE = 0.1;
  const gst = total - (total / (1 + GST_RATE));
  const subtotal = total - gst;

  return (
    <div className="order-summary">
      <h2>Order Summary</h2>
      
      <div className="summary-items">
        {cart.map((item) => (
          <div key={item.menuItem.id} className="summary-item">
            <div className="summary-item-info">
              <h4>{item.menuItem.name}</h4>
              {item.menuItem.size && (
                <span className="summary-item-size">({item.menuItem.size})</span>
              )}
              <p className="summary-item-qty">Qty: {item.quantity}</p>
            </div>
            <div className="summary-item-price">
              ${(item.menuItem.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="summary-totals">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>GST (10%):</span>
          <span>${gst.toFixed(2)}</span>
        </div>
        <div className="summary-row total-row">
          <span>Total:</span>
          <span className="total-amount">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
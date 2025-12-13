import "../styles/pages/order-success.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface OrderReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface LocationState {
  orderCode: string;
  total: number;
  gst: number;
  items: OrderReceiptItem[];
  customerName: string | null;
  tableNumber: string | null;
}

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Redirect if no order data
  useEffect(() => {
    if (!state?.orderCode) {
      navigate("/menu");
    }
  }, [state, navigate]);

  if (!state?.orderCode) {
    return null;
  }

  const subtotal = state.total - state.gst;

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        
        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your order. Your food will be ready soon!
        </p>

        <div className="order-details">
          <div className="order-detail-row">
            <span>Order Code:</span>
            <span className="order-code">{state.orderCode}</span>
          </div>
          
          {state.customerName && (
            <div className="order-detail-row">
              <span>Customer Name:</span>
              <span>{state.customerName}</span>
            </div>
          )}
          
          {state.tableNumber && (
            <div className="order-detail-row">
              <span>Table Number:</span>
              <span>{state.tableNumber}</span>
            </div>
          )}

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            {state.items.map((item, index) => (
              <div key={index} className="receipt-item">
                <div className="receipt-item-info">
                  <span>{item.name}</span>
                  <span className="receipt-qty">x{item.quantity}</span>
                </div>
                <span>${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="receipt-divider"></div>

          <div className="order-detail-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="order-detail-row">
            <span>GST (10%):</span>
            <span>${state.gst.toFixed(2)}</span>
          </div>
          
          <div className="order-detail-row total-row">
            <span>Total:</span>
            <span className="order-total">${state.total.toFixed(2)}</span>
          </div>
        </div>

        <button className="back-to-menu-btn" onClick={() => navigate("/menu")}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}
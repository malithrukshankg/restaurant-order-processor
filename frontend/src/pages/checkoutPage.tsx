import "../styles/pages/checkout.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCheckout } from "../hooks/useCheckout";
import { CheckoutContainer } from "../components/CheckoutContainer";
import type { CheckoutState } from "../types/cart";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const state = location.state as CheckoutState;
  const cart = state?.cart || [];
  const cartTotal = state?.total || 0;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/menu", { replace: true });
    }
  }, [cart.length, navigate]);

  const {
    customerName,
    tableNumber,
    loading,
    error,
    setCustomerName,
    setTableNumber,
    handlePlaceOrder
  } = useCheckout(cart);

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <CheckoutContainer
        cart={cart}
        total={cartTotal}
        customerName={customerName}
        tableNumber={tableNumber}
        onCustomerNameChange={setCustomerName}
        onTableNumberChange={setTableNumber}
        onSubmit={handlePlaceOrder}
        loading={loading}
        error={error}
      />
    </div>
  );
}
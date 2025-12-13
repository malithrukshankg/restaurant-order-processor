import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/order";
import type { CartItem } from "../types/cart";

export function useCheckout(cart: CartItem[]) {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Prepare order data for backend
      const orderData = {
        customerName: customerName.trim() || null,
        tableNumber: tableNumber.trim() || null,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity
        }))
      };

      // Call backend API to create order
      const receipt = await createOrder(orderData);
      
      // Navigate to success page with receipt data
      navigate("/order-success", { 
        state: { 
          orderCode: receipt.orderCode,
          total: receipt.total,
          gst: receipt.gst,
          items: receipt.items,
          customerName: receipt.customerName,
          tableNumber: receipt.tableNumber
        } 
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return {
    customerName,
    tableNumber,
    loading,
    error,
    setCustomerName,
    setTableNumber,
    handlePlaceOrder
  };
}
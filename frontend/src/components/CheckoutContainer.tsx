import { OrderSummary } from "./OrderSummery";
import { CustomerDetailsForm } from "./CustomerDetailsForm";
import type { CartItem } from "../types/cart";

interface CheckoutContainerProps {
  cart: CartItem[];
  total: number;
  customerName: string;
  tableNumber: string;
  onCustomerNameChange: (name: string) => void;
  onTableNumberChange: (table: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
}

export function CheckoutContainer({
  cart,
  total,
  customerName,
  tableNumber,
  onCustomerNameChange,
  onTableNumberChange,
  onSubmit,
  loading,
  error
}: CheckoutContainerProps) {
  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} total={total} />
      
      <CustomerDetailsForm
        customerName={customerName}
        tableNumber={tableNumber}
        onCustomerNameChange={onCustomerNameChange}
        onTableNumberChange={onTableNumberChange}
        onSubmit={onSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
}
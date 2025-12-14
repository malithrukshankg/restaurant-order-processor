import { useNavigate } from "react-router-dom";

interface CustomerDetailsFormProps {
  customerName: string;
  tableNumber: string;
  onCustomerNameChange: (name: string) => void;
  onTableNumberChange: (table: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
}

export function CustomerDetailsForm({
  customerName,
  tableNumber,
  onCustomerNameChange,
  onTableNumberChange,
  onSubmit,
  loading,
  error,
}: CustomerDetailsFormProps) {
  const navigate = useNavigate();

  return (
    <div className="checkout-form-wrapper">
      <h2>Customer Details</h2>
      
      {error && <div className="checkout-error">{error}</div>}

      <form onSubmit={onSubmit} className="checkout-form">
        <div className="form-group">
          <label htmlFor="customerName">Name </label>
          <input
            id="customerName"
            type="text"
            className="form-input"
            placeholder="Enter your name"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tableNumber">Table Number </label>
          <input
            id="tableNumber"
            type="text"
            className="form-input"
            placeholder="Enter table number"
            value={tableNumber}
            onChange={(e) => onTableNumberChange(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/menu")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="place-order-btn"
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
import { apiFetch } from "./client";

// Request types
export interface CreateOrderItem {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName?: string | null;
  tableNumber?: string | null;
  items: CreateOrderItem[];
}

// Response types
export interface OrderReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderReceipt {
  orderCode: string;
  customerName: string | null;
  tableNumber: string | null;
  total: number;
  gst: number;
  items: OrderReceiptItem[];
}

// Create a new order
export function createOrder(orderData: CreateOrderRequest) {
  return apiFetch<OrderReceipt>("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}
export interface OrderItemInput {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerName?: string;
  tableNumber?: string;
  items: OrderItemInput[];
}

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

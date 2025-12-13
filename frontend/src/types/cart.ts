import type { MenuItem } from "./menuItem";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CheckoutState {
  cart: CartItem[];
  total: number;
}
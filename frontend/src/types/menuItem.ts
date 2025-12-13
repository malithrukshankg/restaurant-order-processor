export interface MenuItem {
  id: number;
  name: string;
  price: number;
  type: "BURGER" | "DRINK";
  size: "SMALL" | "LARGE" | null;
  isActive: boolean;
}

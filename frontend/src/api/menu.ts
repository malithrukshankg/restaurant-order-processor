import { apiFetch } from "./client";
import type {MenuItem} from "../types/menuItem"

// Fetch all active menu items
export function getMenuItems() {
  return apiFetch<MenuItem[]>("/menu", {
    method: "GET",
  });
}
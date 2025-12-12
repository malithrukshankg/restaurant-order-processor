import { apiFetch } from "./client";
import type { LoginResponse } from "../types/auth";

// Calls backend login endpoint and returns token + user info
export function login(email: string, password: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

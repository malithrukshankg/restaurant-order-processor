// Auth-related types shared across the frontend

export type UserRole = "customer" | "admin";

export interface AuthUser {
  userId: number;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

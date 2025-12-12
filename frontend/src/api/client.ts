// Backend API base URL (uses env var, falls back for local dev)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

// Shared helper for making API calls to the backend
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Read JWT token if user is logged in
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Attach auth header only when token exists
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // Handle backend errors gracefully
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(message);
  }

  // Return parsed JSON response
  return res.json();
}

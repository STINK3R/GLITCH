import { useAuthStore } from "../features/auth/AuthStore";

const API_URL = import.meta.env.VITE_API_URL || "";

export async function http(path, options = {}) {
  const token = localStorage.getItem("token");

  const baseHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const mergedHeaders = {
    ...baseHeaders,
    ...(options.headers || {}),
  };

  const res = await fetch(API_URL + path, {
    credentials: "include",
    ...options,
    headers: mergedHeaders,
  });

  const contentType = res.headers.get("content-type") || "";
  let payload = null;
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch (_) {
      payload = null;
    }
  } else {
    try {
      payload = await res.text();
    } catch (_) {
      payload = null;
    }
  }

  if (res.status === 401) {
    // Если получен 401 Unauthorized, сбрасываем авторизацию
    useAuthStore.getState().logout();
  }

  if (!res.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      (typeof payload === "string" ? payload : "") ||
      `HTTP error! Status: ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return payload;
}

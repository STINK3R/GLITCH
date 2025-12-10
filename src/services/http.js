import { useAuthStore } from "../features/auth/AuthStore";

const API_URL = import.meta.env.VITE_API_URL || "";

export async function http(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    credentials: "include",
    ...options,
    headers,
  };
  
  delete config.skipAuth; // удаляем кастомное свойство перед передачей в fetch

  const res = await fetch(API_URL + path, config);

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
    console.error("HTTP Request Failed:", {
        path,
        status: res.status,
        payload
    });

    const message =
      (payload && (JSON.stringify(payload.detail) || payload.message || payload.error || payload.detail)) ||
      (typeof payload === "string" ? payload : "") ||
      `HTTP error! Status: ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return payload;
}

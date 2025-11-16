// src/services/api.js

// Always read from VITE_API_BASE
const BASE = import.meta.env.VITE_API_BASE;

export async function api(path, options = {}) {
  const token = await window.auth?.currentUser?.getIdToken?.();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {})
    }
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response — ignore
  }

  if (!res.ok) {
    console.error("API ERROR", res.status, data || res.statusText);
    throw data || new Error(`API ${res.status}: ${res.statusText}`);
  }

  return data;
}

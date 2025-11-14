// src/services/api.js

export async function api(path, options = {}) {
  const token = await window.auth?.currentUser?.getIdToken?.();
  
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
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
    // ignore non-json responses (500 pages, etc)
  }

  if (!res.ok) {
    console.error("API ERROR", res.status, data || res.statusText);
    throw data || new Error(`API ${res.status}: ${res.statusText}`);
  }

  return data;
}

// src/services/api.js

// 🔥 Hard-coded backend URL
const BASE = "https://rps64-backend-1.onrender.com";

export async function api(path, opts = {}) {
  const url = `${BASE}${path}`;
  console.log("[API]", url);

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...opts,
  });

  if (!res.ok) {
    console.error("API Error:", res.status, url);
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

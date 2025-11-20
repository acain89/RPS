import { auth } from "./firebase";

export async function api(path, opts = {}) {
  console.log("🔥 USING services/api.js");

  // Always use the configured API base
  const base = import.meta.env.VITE_API_BASE;
  console.log("[API] BASE =", base);
  console.log("[API] Using:", base + path);

  let headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {})
  };

  // 🔥 REMOVE auto-dev mode — only use dev override if you manually set it
  const useFake = import.meta.env.VITE_USE_FAKE_BACKEND === "1";

  if (useFake) {
    console.log("🧪 FAKE MODE ENABLED");
    headers["x-user-id"] = "dev-user";
  } else {
    // 🔥 PROD / REAL AUTH
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(base + path, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  return res.json().catch(() => ({}));
}

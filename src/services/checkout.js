// src/services/checkout.js

import { auth } from "./firebase";

export async function startCheckout(tier) {
  const API = import.meta.env.VITE_API_BASE;
  console.log("[CHECKOUT] BASE →", API);

  let headers = {
    "Content-Type": "application/json",
  };

  // If running production → send Firebase token
  const useFake = import.meta.env.VITE_USE_FAKE_BACKEND === "1";

  if (!useFake) {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
  } else {
    headers["x-user-id"] = "dev-user";
  }

  const res = await fetch(`${API}/api/create-checkout-session`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tier }),
  });

  const data = await res.json();
  console.log("[CHECKOUT] Redirecting →", data.url);

  window.location.href = data.url;
}

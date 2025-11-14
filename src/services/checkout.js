export async function startCheckout(tier) {
  const res = await fetch("http://localhost:10000/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });

  const data = await res.json();
  window.location.href = data.url;
}

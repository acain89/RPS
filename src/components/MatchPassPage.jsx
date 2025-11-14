// src/components/MatchPassSelect.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function MatchPassSelect() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const tiers = [
    { id: "rookie", name: "Rookie", price: 9.99, matches: 6, payout: 3 },
    { id: "pro", name: "Pro", price: 14.99, matches: 6, payout: 4.5 },
    { id: "elite", name: "Elite", price: 19.99, matches: 6, payout: 6 },
  ];

  // ✅ If user already has a pass, skip to player-home
  useEffect(() => {
    async function loadPass() {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-match-pass`);
        const data = await res.json();

        if (data && data.matchesPlayed < data.matchesTotal) {
          setTimeout(() => navigate("/player-home"), 300);
        }
      } catch (err) {
        console.error("Fetch pass error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPass();
  }, [navigate]);

  // ✅ Fake buy - create a match pass and go to dashboard
  async function buy(tier) {
    if (!auth.currentUser) return navigate("/auth");

    const t = tiers.find((x) => x.id === tier);

    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/fake-create-match-pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          tier: t.id,
          matchesTotal: t.matches,
          payout: t.payout,
        }),
      });

      navigate("/player-home");
    } catch (err) {
      console.error("Pass purchase error:", err);
      alert("Error buying pass");
    }
  }

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "80px", fontSize: "18px", color: "#00FFE0" }}>
        Loading…
      </p>
    );

  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: "60px",
        color: "#00FFE0",
        fontFamily: "Rajdhani, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "6px" }}>Choose Your Match Pass</h1>
      <p style={{ opacity: 0.8, marginBottom: "28px" }}>Play 6 matches • Earn cash per win</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "22px" }}>
        {tiers.map((t) => (
          <div
            key={t.id}
            style={{
              background: "rgba(0,255,224,0.05)",
              border: "1px solid rgba(0,255,224,0.25)",
              padding: "20px",
              width: "210px",
              borderRadius: "12px",
              boxShadow: "0 0 12px rgba(0,255,224,0.15)",
            }}
          >
            <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>{t.name}</h2>
            <p style={{ fontSize: "20px" }}>${t.price.toFixed(2)}</p>
            <p>{t.matches} Matches</p>
            <p>${t.payout} per win</p>

            <button
              onClick={() => buy(t.id)}
              style={{
                marginTop: "12px",
                background: "#00FFE0",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Get {t.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

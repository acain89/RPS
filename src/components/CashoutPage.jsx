import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function CashoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState(null);
  const [error, setError] = useState("");

  const FEE_RATE = 0.05;

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) navigate("/auth?redirect=cashout");
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-match-pass`);
        const data = await res.json();
        if (!data) {
          navigate("/match-pass");
          return;
        }
        setPass(data);
      } catch (e) {
        setError("Failed to load balance");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  if (loading) return <div style={{ textAlign: "center", paddingTop: 120, color: "#00FFE0" }}>Loading…</div>;
  if (error) return <div style={{ textAlign: "center", paddingTop: 120, color: "#ff6666" }}>{error}</div>;
  if (!pass) return null;

  const gross = Number(pass.wins || 0) * Number(pass.payout || 0);
  const fee = +(gross * FEE_RATE).toFixed(2);
  const net = +(gross - fee).toFixed(2);

  async function setupPayouts() {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-winner-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer fake` }
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url; // Stripe Express onboarding
        return;
      }
      alert("Could not start payout onboarding yet.");
    } catch (e) {
      console.error(e);
      alert("Error starting payout onboarding.");
    }
  }

  async function confirmCashout() {
    // Placeholder: we’ll wire backend next step (B)
    alert(`Cashout requested: $${net.toFixed(2)} (after 5% fee)`);
    navigate("/home");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#091921,#0a2a33)",
        color: "#00FFE0",
        fontFamily: "'Rajdhani', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "rgba(0,255,213,0.06)",
          border: "2px solid rgba(0,255,213,0.4)",
          borderRadius: 14,
          padding: "28px 24px",
          boxShadow: "0 0 18px rgba(0,255,213,0.22)"
        }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 6 }}>Cash Out</h2>
        <p style={{ opacity: 0.85, marginBottom: 18 }}>Withdraw your winnings after finishing your 6 matches.</p>

        <div style={{ fontSize: 18, margin: "10px 0" }}>Wins: <b>{pass.wins}</b></div>
        <div style={{ fontSize: 18, margin: "10px 0" }}>${pass.payout?.toFixed(2)} per win</div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(0,255,213,0.25)", margin: "18px 0" }} />

        <div style={{ fontSize: 18, margin: "6px 0" }}>
          Gross Winnings: <b>${gross.toFixed(2)}</b>
        </div>
        <div style={{ fontSize: 18, margin: "6px 0", color: "#66e0d0" }}>
          Cash-out Fee (5%): <b>-${fee.toFixed(2)}</b>
        </div>
        <div style={{ fontSize: 20, margin: "12px 0 20px" }}>
          You Receive: <b>${net.toFixed(2)}</b>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={setupPayouts}
            style={{
              background: "transparent",
              color: "#00FFE0",
              border: "2px solid #00FFE0",
              padding: "12px 20px",
              borderRadius: 10,
              fontSize: 16,
              cursor: "pointer",
              minWidth: 170
            }}
          >
            Set Up Payouts
          </button>

          <button
            onClick={confirmCashout}
            style={{
              background: "#00FFE0",
              color: "#002824",
              border: "none",
              padding: "12px 20px",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              minWidth: 170
            }}
          >
            Confirm Cash Out
          </button>
        </div>

        <button
          onClick={() => navigate("/home")}
          style={{
            marginTop: 18,
            background: "transparent",
            color: "#00FFE0",
            border: "none",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Back to Home
        </button>

        <p style={{ marginTop: 14, fontSize: 14, opacity: 0.8 }}>
          Winnings cannot be used to re-buy. New entries keep competition fair.
        </p>
      </div>
    </div>
  );
}

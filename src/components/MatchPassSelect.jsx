import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../services/firebase";

const TIERS = [
  { id: "rookie", label: "Rookie", price: 9.99, perWin: 3, matches: 6 },
  { id: "pro", label: "Pro", price: 14.99, perWin: 4.5, matches: 6 },
  { id: "elite", label: "Elite", price: 19.99, perWin: 6, matches: 6 },
];

export default function MatchPassSelect() {
  const navigate = useNavigate();

  // ✅ Debug line to confirm backend URL from .env
  useEffect(() => {
    console.log("VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
  }, []);

  function buy(tier) {
    if (!auth.currentUser) return navigate("/auth?redirect=match-pass");
    navigate("/match-pass"); // Stripe step later
  }

  function goBack() {
    navigate("/how-to-play");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#091921,#0a2a33)",
        color: "#00FFE0",
        fontFamily: "'Rajdhani',sans-serif",
        paddingTop: "70px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>Choose Your Match Pass</h1>
      <p style={{ opacity: 0.8, marginBottom: 40 }}>
        6 matches. Earn per win. No bots.
      </p>

      <div
        style={{
          display: "grid",
          gap: 22,
          maxWidth: 900,
          margin: "0 auto",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        }}
      >
        {TIERS.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
            style={{
              background: "rgba(0,255,224,0.08)",
              border: "1px solid rgba(0,255,224,0.25)",
              borderRadius: 14,
              padding: "26px 18px",
              boxShadow: "0 0 24px rgba(0,255,213,0.12)",
            }}
          >
            <h2 style={{ fontSize: 28, marginBottom: 6 }}>{t.label}</h2>
            <div style={{ fontSize: 30, fontWeight: 700 }}>${t.price}</div>
            <div style={{ opacity: 0.8, margin: "6px 0 20px" }}>
              {t.matches} matches • ${t.perWin}/win
            </div>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => buy(t)}
              style={{
                background: "#00FFE0",
                color: "#002824",
                border: "none",
                padding: "12px 24px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Get {t.label}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <button
        onClick={goBack}
        style={{
          marginTop: 32,
          background: "transparent",
          color: "#00FFE0",
          border: "2px solid #00FFE0",
          padding: "10px 22px",
          borderRadius: 10,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Back
      </button>
    </div>
  );
}

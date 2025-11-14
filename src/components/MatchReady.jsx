import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MatchReady({ matchesRemaining = 6, wins = 0, earnings = 0 }) {
  const navigate = useNavigate();

  function handleFindOpponent() {
    // Simulate brief matchmaking
    setTimeout(() => navigate("/match-arena"), 1200);
  }

  return (
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        textAlign: "center",
        padding: "20px"
      }}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          color: "#00FFD5",
          fontSize: "30px",
          marginBottom: "8px"
        }}
      >
        ✅ Match Pass Activated
      </motion.h2>

      <p style={{ color: "#00FFD5", fontSize: "18px", marginBottom: "30px" }}>
        {matchesRemaining} Matches Remaining
      </p>

      {/* Pulsing Button */}
      <motion.button
        onClick={handleFindOpponent}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.94 }}
        style={{
          background: "#00FFD5",
          color: "#001b16",
          padding: "18px 42px",
          borderRadius: "12px",
          border: "none",
          fontSize: "22px",
          fontWeight: "700",
          cursor: "pointer",
          marginBottom: "30px",
          boxShadow: "0 0 25px rgba(0,255,213,0.7)"
        }}
      >
        Find Opponent
      </motion.button>

      {/* Stats */}
      <div style={{ color: "#00FFD5", fontSize: "16px", opacity: 0.9 }}>
        Wins: {wins} / {matchesRemaining}
        <br />
        Earnings: ${earnings.toFixed(2)}
      </div>
    </div>
  );
}

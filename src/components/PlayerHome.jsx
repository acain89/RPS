import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { motion } from "framer-motion";

export default function PlayerHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check auth
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) return navigate("/auth");
      setUser(u);
    });
    return () => unsub();
  }, [navigate]);

  // ✅ Load match pass data
  useEffect(() => {
    async function loadPass() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-match-pass`);
        const data = await res.json();
        setPass(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPass();
  }, []);

  if (loading || !user)
    return <div style={{ paddingTop: "120px", textAlign: "center", color: "#00FFE0" }}>Loading...</div>;

  // If no pass → send to pass purchase
  if (!pass) return navigate("/match-pass");

  const matchesLeft = pass.matchesTotal - pass.matchesPlayed;
  const canCashOut = matchesLeft === 0;
  const totalEarned = pass.wins * pass.payout;

  // ✅ Actions
  const playMatch = () => navigate("/match-arena");
  const cashOut = () => navigate("/cashout");
  const buyMore = () => navigate("/match-pass");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#091921,#0a2a33)",
        color: "#00FFE0",
        textAlign: "center",
        paddingTop: "60px",
        fontFamily: "'Rajdhani', sans-serif",
        position: "relative"
      }}
    >

      {/* 🔹 Profile button */}
      <button
        onClick={() => navigate("/profile")}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "transparent",
          color: "#00FFE0",
          border: "none",
          fontSize: "18px",
          cursor: "pointer"
        }}
      >
        Profile
      </button>

      {/* 🔹 Logout button */}
      <button
        onClick={() => auth.signOut().then(() => navigate("/auth"))}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "transparent",
          color: "#00FFE0",
          border: "2px solid #00FFE0",
          padding: "8px 18px",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>

      {/* ✅ Greeting */}
      <h1 style={{ fontSize: "32px", marginBottom: "6px" }}>
        Welcome, {user.email.split("@")[0]}
      </h1>
      <h3 style={{ opacity: 0.8 }}>Match Pass Active</h3>

      {/* ✅ Progress circle */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          margin: "40px auto",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          border: "5px solid rgba(0,255,213,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 25px rgba(0,255,213,0.25)"
        }}
      >
        <div>
          <div style={{ fontSize: "32px", fontWeight: "700" }}>{matchesLeft}</div>
          <div style={{ fontSize: "16px", opacity: 0.8 }}>Matches Left</div>
        </div>
      </motion.div>

      {/* ✅ Earnings */}
      <div style={{ fontSize: "22px", marginBottom: "22px" }}>
        💰 Earnings:
        <span style={{ color: "#00FFE0" }}> ${totalEarned.toFixed(2)}</span>
      </div>

      {/* 🎮 Play / Cash Out Buttons */}
      {!canCashOut && (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={playMatch}
          style={{
            background: "#00FFE0",
            color: "#002824",
            padding: "14px 28px",
            borderRadius: "10px",
            border: "none",
            fontSize: "18px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "16px"
          }}
        >
          ▶ Play Next Match
        </motion.button>
      )}

      {canCashOut && (
        <>
          {/* Cashout */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={cashOut}
            style={{
              background: "#00FFE0",
              color: "#002824",
              padding: "14px 28px",
              borderRadius: "10px",
              border: "none",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              marginBottom: "10px"
            }}
          >
            Cash Out ${totalEarned.toFixed(2)}
          </motion.button>

          {/* Replay */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={buyMore}
            style={{
              background: "transparent",
              color: "#00FFE0",
              border: "2px solid #00FFE0",
              padding: "12px 28px",
              borderRadius: "10px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            🔄 Buy New Match Pass
          </motion.button>
        </>
      )}

    </div>
  );
}

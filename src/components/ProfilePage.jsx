import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pass, setPass] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) navigate("/auth?redirect=profile");
      setUser(u);
    });
    return () => unsub();
  }, [navigate]);

  // Load pass + matches
  useEffect(() => {
    async function load() {
      try {
        const passRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-match-pass`);
        const passData = await passRes.json();
        setPass(passData);

        // Later we will build a match history API. Placeholder for now:
        setMatches(passData?.matchHistory || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ textAlign: "center", paddingTop: 120, color: "#00FFE0" }}>Loading…</div>;
  if (!user) return null;

  const username = user.email.split("@")[0];
  const wins = pass?.wins || 0;
  const total = (wins * (pass?.payout || 0)).toFixed(2);
  const played = pass?.matchesPlayed || 0;
  const totalMatches = pass?.matchesTotal || 6;
  const left = totalMatches - played;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#091921,#0a2a33)",
        color: "#00FFE0",
        fontFamily: "'Rajdhani', sans-serif",
        padding: "40px 20px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <button
          onClick={() => navigate("/home")}
          style={{
            background: "transparent",
            color: "#00FFE0",
            border: "none",
            fontSize: "20px",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>

        <button
          onClick={() => auth.signOut().then(() => navigate("/auth"))}
          style={{
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
      </div>

      {/* Player */}
      <h2 style={{ fontSize: "32px", marginBottom: 6 }}>{username}</h2>
      <p style={{ opacity: 0.7, marginBottom: 28 }}>{user.email}</p>

      {/* Stats */}
      <div
        style={{
          background: "rgba(0,255,213,0.06)",
          border: "2px solid rgba(0,255,213,0.4)",
          borderRadius: "14px",
          padding: "22px",
          marginBottom: "28px",
          textAlign: "center",
          boxShadow: "0 0 18px rgba(0,255,213,0.22)"
        }}
      >
        <div style={{ fontSize: "18px", margin: "6px 0" }}>Matches Played: {played}/{totalMatches}</div>
        <div style={{ fontSize: "18px", margin: "6px 0" }}>Wins: {wins}</div>
        <div style={{ fontSize: "20px", margin: "12px 0" }}>
          Balance: <b>${total}</b>
        </div>

        {left > 0 ? (
          <button
            onClick={() => navigate("/match-arena")}
            style={{
              background: "#00FFE0",
              color: "#002824",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              marginTop: "14px"
            }}
          >
            ▶️ Play Next Match
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/cashout")}
              style={{
                background: "#00FFE0",
                color: "#002824",
                border: "none",
                padding: "12px 20px",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                marginTop: "10px",
                marginBottom: "10px"
              }}
            >
              Cash Out ${total}
            </button>

            <button
              onClick={() => navigate("/match-pass")}
              style={{
                background: "transparent",
                color: "#00FFE0",
                border: "2px solid #00FFE0",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              Buy Another Pass
            </button>
          </>
        )}
      </div>

      {/* Match history placeholder */}
      <h3 style={{ marginBottom: 10 }}>Match History</h3>
      {matches.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No matches logged yet</p>
      ) : (
        matches.map((m, i) => (
          <div key={i} style={{ marginBottom: 6, fontSize: 16 }}>
            {m.result === "win" ? "✅ Win" : "❌ Loss"} — vs Opponent #{m.opponent}
          </div>
        ))
      )}
    </div>
  );
}

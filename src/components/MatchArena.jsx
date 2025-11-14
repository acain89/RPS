import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../services/firebase";

const MOVES = ["rock", "paper", "scissors"];
const HAND = { rock: "✊", paper: "✋", scissors: "✌️" };

const LIVES = 3;
const ROUND_TIME = 20; // seconds

export default function MatchArena() {
  const navigate = useNavigate();

  // auth
  const [user, setUser] = useState(null);

  // pass (for match wins tracker)
  const [pass, setPass] = useState(null); // {wins, matchesPlayed, matchesTotal, payout}
  const wins = pass?.wins ?? 0;
  const played = pass?.matchesPlayed ?? 0;
  const total = pass?.matchesTotal ?? 6;
  const oppWins = Math.max(0, played - wins);

  // per-match state
  const [topLives, setTopLives] = useState(LIVES);
  const [botLives, setBotLives] = useState(LIVES);
  const [preStart, setPreStart] = useState(3);
  const [round, setRound] = useState(1);

  // timer ring
  const [t, setT] = useState(ROUND_TIME);
  const tRef = useRef(null);

  // picks
  const [topPick, setTopPick] = useState(null);
  const [botPick, setBotPick] = useState(null);

  // overlays
  const [showNext, setShowNext] = useState(false);
  const [result, setResult] = useState(""); // "win" | "lose" | "tie"

  // ---- lifecycle ----
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) navigate("/auth?redirect=match-arena");
      else setUser(u);
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    async function loadPass() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-match-pass`);
        const data = await res.json();
        if (!data) return navigate("/match-pass");
        setPass(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadPass();
  }, [navigate]);

  // start countdown then timer
  useEffect(() => {
    if (preStart <= 0) {
      startTimer();
      return;
    }
    const id = setTimeout(() => setPreStart((n) => n - 1), 900);
    return () => clearTimeout(id);
  }, [preStart]);

  const disabled = useMemo(
    () => preStart > 0 || showNext || result || topLives === 0 || botLives === 0,
    [preStart, showNext, result, topLives, botLives]
  );

  function startTimer() {
    clearInterval(tRef.current);
    setT(ROUND_TIME);
    tRef.current = setInterval(() => {
      setT((x) => {
        if (x <= 1) {
          clearInterval(tRef.current);
          // auto-pick if user idle
          if (!topPick) onTopPick("rock", true);
        }
        return x - 1;
      });
    }, 1000);
  }

  function cpuPick() {
    return MOVES[Math.floor(Math.random() * 3)];
  }

  function onTopPick(move, fromTimeout = false) {
    if (disabled) return;
    clearInterval(tRef.current);
    setTopPick(move);
    // delay CPU reveal for flip effect
    const cp = cpuPick();
    setTimeout(() => {
      setBotPick(cp);
      resolve(move, cp);
    }, 420);
  }

  function resolve(a, b) {
    let r = "tie";
    if (a !== b) {
      const win =
        (a === "rock" && b === "scissors") ||
        (a === "paper" && b === "rock") ||
        (a === "scissors" && b === "paper");
      r = win ? "win" : "lose";
    }
    setResult(r);

    setTimeout(() => {
      if (r === "win") setBotLives((l) => Math.max(0, l - 1));
      if (r === "lose") setTopLives((l) => Math.max(0, l - 1));

      setResult("");
      setShowNext(true);

      setTimeout(() => {
        setShowNext(false);
        setTopPick(null);
        setBotPick(null);

        // match end?
        if (topLives <= 1 && r === "lose") return finishMatch(false);
        if (botLives <= 1 && r === "win") return finishMatch(true);

        // next round
        setRound((r) => r + 1);
        startTimer();
      }, 700);
    }, 560);
  }

  async function finishMatch(playerWon) {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-match-pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.currentUser?.uid || "test-user-123",
          playedDelta: 1,
          winDelta: playerWon ? 1 : 0,
        }),
      });
    } catch (e) {
      console.error("pass update failed", e);
    }
    // go back to player home
    navigate("/player-home");
  }

  // ---- small components ----
  function LifeDots({ count }) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: LIVES }).map((_, i) => {
          const on = i < count;
          return (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: on ? "rgba(255,40,40,1)" : "rgba(120,20,20,0.35)",
                boxShadow: on ? "0 0 12px rgba(255,50,50,0.8)" : "none",
              }}
            />
          );
        })}
      </div>
    );
  }

  function TimerRing({ seconds }) {
    // small ring (A)
    const size = 42;
    const stroke = 4;
    const r = (size - stroke) / 2;
    const C = 2 * Math.PI * r;
    const pct = Math.max(0, seconds / ROUND_TIME);
    return (
      <svg width={size} height={size} style={{ filter: "drop-shadow(0 0 4px rgba(0,255,213,.5))" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,255,213,.15)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(0,255,213,.9)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="54%"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#00FFE0"
          style={{ fontFamily: "Rajdhani, sans-serif" }}
        >
          {Math.max(0, seconds)}
        </text>
      </svg>
    );
  }

  function Tallies() {
    // one shared vertical tracker with a thick glowing divider (B)
    return (
      <div
        style={{
          position: "absolute",
          right: 18,
          top: "50%",
          transform: "translateY(-50%)",
          width: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Top tallies (Player A) */}
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={`you-${i}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: i < wins ? "#00FFE0" : "rgba(0,255,213,0.22)",
              boxShadow: i < wins ? "0 0 10px rgba(0,255,213,0.7)" : "none",
            }}
          />
        ))}

        {/* thick neon “lightning” divider */}
        <div
          style={{
            width: 14,
            height: 4,
            borderRadius: 4,
            background: "linear-gradient(90deg,rgba(0,255,213,0.2),rgba(0,255,213,0.9),rgba(0,255,213,0.2))",
            boxShadow: "0 0 16px rgba(0,255,213,0.9), 0 0 28px rgba(0,255,213,0.5)",
            margin: "6px 0",
          }}
        />

        {/* Bottom tallies (Player B) */}
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={`them-${i}`}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: i < oppWins ? "#ff5c5c" : "rgba(255,92,92,0.22)",
              boxShadow: i < oppWins ? "0 0 10px rgba(255,92,92,0.7)" : "none",
            }}
          />
        ))}
      </div>
    );
  }

  function NESButton({ move, onClick, active, ghost }) {
    return (
      <motion.button
        whileTap={ghost ? undefined : { scale: 0.94 }}
        onClick={ghost ? undefined : () => onClick(move)}
        disabled={ghost}
        style={{
          width: 110,
          height: 84,
          borderRadius: 6, // square NES (A)
          background: ghost ? "rgba(255,92,92,0.08)" : "#00FFE0",
          border: ghost ? "2px solid rgba(255,92,92,0.55)" : "none",
          color: ghost ? "rgba(255,92,92,0.95)" : "#002824",
          fontSize: 34,
          fontWeight: 800,
          cursor: ghost ? "default" : "pointer",
          boxShadow: ghost ? "none" : "0 0 18px rgba(0,255,213,0.55)",
          opacity: active ? 1 : 0.95,
          transform: active ? "translateY(-2px)" : "none",
        }}
      >
        {HAND[move]}
      </motion.button>
    );
  }

  // ---- render ----
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#091921,#0a2a33)",
        color: "#00FFE0",
        fontFamily: "Rajdhani, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Tallies />

      {/* Countdown banner */}
      <AnimatePresence>
        {preStart > 0 && (
          <motion.div
            key={`pre-${preStart}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,255,213,0.10)",
              border: "1px solid rgba(0,255,213,0.35)",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 800,
            }}
          >
            Match starts in {preStart}…
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== TOP (Player A) ===== */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 64,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>
          {user?.email?.split("@")[0] || "You"}
        </div>

        {/* lives + timer (small ring at right) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 12 }}>
          <LifeDots count={topLives} />
          <div style={{ width: 8 }} />
          <TimerRing seconds={t} />
        </div>

        {/* top RPS row */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          {MOVES.map((m) => (
            <NESButton key={`t-${m}`} move={m} onClick={onTopPick} active={topPick === m} ghost={disabled} />
          ))}
        </div>
      </div>

      {/* ===== DIVIDER (thick neon lightning) + match counter label to the right ===== */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "78%",
          maxWidth: 880,
          transform: "translate(-50%,-50%)",
          height: 4,
          background:
            "linear-gradient(90deg, rgba(0,255,213,0), rgba(0,255,213,0.9), rgba(0,255,213,0))",
          boxShadow: "0 0 24px rgba(0,255,213,0.7), 0 0 42px rgba(0,255,213,0.35)",
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 72,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 14,
          opacity: 0.85,
        }}
      >
        Match {Math.min(played + 1, total)} / {total}
      </div>

      {/* ===== BOTTOM (Player B) ===== */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 64,
          textAlign: "center",
        }}
      >
        {/* bottom RPS row (ghost; shows flip/reveal only) */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 12 }}>
          {MOVES.map((m) => (
            <motion.div
              key={`b-${m}`}
              animate={
                botPick === m
                  ? { rotateY: [0, 180, 0], scale: [1, 1.06, 1] }
                  : { opacity: 0.35 }
              }
              transition={{ duration: 0.5 }}
              style={{ perspective: 400 }}
            >
              <NESButton move={m} ghost active={botPick === m} />
            </motion.div>
          ))}
        </div>

        {/* lives + timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
          <LifeDots count={botLives} />
          <div style={{ width: 8 }} />
          <TimerRing seconds={t} />
        </div>

        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Opponent</div>
      </div>

      {/* fade-flip outcome text */}
      <AnimatePresence>
        {result && (
          <motion.div
            key={`res-${result}`}
            initial={{ opacity: 0, rotateX: -20 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "absolute",
              top: "12%",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 34,
              fontWeight: 800,
              color:
                result === "win" ? "#00FFE0" : result === "lose" ? "#ff5c5c" : "#A0A0A0",
              textShadow:
                result === "win"
                  ? "0 0 14px rgba(0,255,213,0.6)"
                  : result === "lose"
                  ? "0 0 14px rgba(255,92,92,0.6)"
                  : "none",
            }}
          >
            {result === "win" ? "Win!" : result === "lose" ? "Lose!" : "Tie!"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Round overlay */}
      <AnimatePresence>
        {showNext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            Next Round…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

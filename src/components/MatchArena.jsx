// src/components/MatchArena.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../services/firebase";
import "./MatchArena.css";

const MOVES = ["rock", "paper", "scissors"];
const HAND = { rock: "✊", paper: "✋", scissors: "✌️" };

const LIVES = 3;
const ROUND_TIME = 20;
const MATCHES_TOTAL = 10;

/* ----------- PASS CONFIG ----------- */
const TIER_CONFIG = {
  rookie: { tier: "ROOKIE", payout: 2.0, matches: 10 },
  pro: { tier: "PRO", payout: 3.0, matches: 10 },
  elite: { tier: "ELITE", payout: 4.0, matches: 10 },
};

export default function MatchArena() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ----------------- AUTH ----------------- */
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) navigate("/auth?redirect=match-arena");
      else setUser(u);
    });
    return unsub;
  }, [navigate]);

  /* --------- MATCH PASS / PAYOUT ---------- */

  const [pass, setPass] = useState(null);

  useEffect(() => {
    // Read incoming pass selection
    const passId = location.state?.passId ?? "rookie";
    const found = TIER_CONFIG[passId];

    if (found) {
      setPass(found);
    } else {
      // fallback
      setPass(TIER_CONFIG.rookie);
    }
  }, [location.state]);

  const payoutPerRound = pass?.payout || 0;

  /* -------------- ARENA STATE ------------- */

  const [matchIndex, setMatchIndex] = useState(1);

  const [topLives, setTopLives] = useState(LIVES);
  const [botLives, setBotLives] = useState(LIVES);

  const [topPick, setTopPick] = useState(null);
  const [botPick, setBotPick] = useState(null);

  const [result, setResult] = useState("");

  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [timeoutSide, setTimeoutSide] = useState(null);

  const [earnTop, setEarnTop] = useState(0);
  const [earnBot, setEarnBot] = useState(0);

  const [matchResults, setMatchResults] = useState(
    () => Array(MATCHES_TOTAL).fill(null)
  );

  const [showRoundBanner, setShowRoundBanner] = useState(false);
  const [roundLabel, setRoundLabel] = useState("Round 1");
  const [showFinalBanner, setShowFinalBanner] = useState(false);

  const [showIntro, setShowIntro] = useState(true);

  const [t, setT] = useState(ROUND_TIME);
  const tRef = useRef(null);

  const [topLifePop, setTopLifePop] = useState(false);
  const [botLifePop, setBotLifePop] = useState(false);

  useEffect(() => {
    if (!topLifePop) return;
    const id = setTimeout(() => setTopLifePop(false), 550);
    return () => clearTimeout(id);
  }, [topLifePop]);

  useEffect(() => {
    if (!botLifePop) return;
    const id = setTimeout(() => setBotLifePop(false), 550);
    return () => clearTimeout(id);
  }, [botLifePop]);

  /* ----------------- MUSIC ---------------- */
  const bgRef = useRef(null);
  useEffect(() => {
    const audio = new Audio("/sounds/arena_theme.mp3");
    audio.loop = true;
    audio.volume = 0.12;
    audio.play().catch(() => {});
    bgRef.current = audio;
    return () => audio.pause();
  }, []);

  /* -------- INTRO → START MATCH ----------- */
  useEffect(() => {
    const id = setTimeout(() => {
      setShowIntro(false);
      startMatch(1);
    }, 3500);
    return () => clearTimeout(id);
  }, []);

  const disabled = useMemo(
    () =>
      showIntro ||
      showRoundBanner ||
      showNextOverlay ||
      !!result ||
      !!timeoutSide ||
      t <= 0,
    [showIntro, showRoundBanner, showNextOverlay, result, timeoutSide, t]
  );

  /* ---------------- TIMER ----------------- */
  function clearTimer() {
    if (tRef.current) clearInterval(tRef.current);
    tRef.current = null;
  }

  function startTimer() {
    clearTimer();
    setT(ROUND_TIME);
    tRef.current = setInterval(() => {
      setT((prev) => {
        if (prev <= 1) {
          clearTimer();
          handleTimeout("both");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  /* -------------- MATCH FLOW -------------- */
  function startMatch(index) {
    if (index === 1) {
      setEarnTop(0);
      setEarnBot(0);
    }

    setMatchIndex(index);
    setTopLives(LIVES);
    setBotLives(LIVES);
    setTopPick(null);
    setBotPick(null);
    setResult("");
    setTimeoutSide(null);

    setRoundLabel(`Round ${index}`);
    setShowFinalBanner(index === 10);
    setShowRoundBanner(true);

    clearTimer();
    setT(ROUND_TIME);

    setTimeout(() => {
      setShowRoundBanner(false);
      startTimer();
    }, 2000);
  }

  function cpuPick() {
    return MOVES[Math.floor(Math.random() * 3)];
  }

  function onTopPick(move) {
    if (disabled) return;
    clearTimer();
    setTopPick(move);

    const cp = cpuPick();
    setTimeout(() => {
      setBotPick(cp);
      resolveTurn(move, cp);
    }, 400);
  }

  function resolveTurn(a, b) {
    let r = "tie";
    if (a !== b) {
      const win =
        (a === "rock" && b === "scissors") ||
        (a === "paper" && b === "rock") ||
        (a === "scissors" && b === "paper");
      r = win ? "win" : "lose";
    }

    let newTop = topLives;
    let newBot = botLives;

    if (r === "lose") {
      newTop = Math.max(0, topLives - 1);
      setTopLives(newTop);
      setTopLifePop(true);
    }

    if (r === "win") {
      newBot = Math.max(0, botLives - 1);
      setBotLives(newBot);
      setBotLifePop(true);
    }

    setResult(r);

    setTimeout(() => {
      const matchEnded = newTop === 0 || newBot === 0;

      if (matchEnded) {
        const winner =
          newTop === 0 && newBot === 0
            ? "tie"
            : newBot === 0
            ? "win"
            : "lose";

        if (winner === "win") {
          setEarnTop((e) => e + payoutPerRound);
        } else if (winner === "lose") {
          setEarnBot((e) => e + payoutPerRound);
        }

        setShowNextOverlay(true);

        setTimeout(() => {
          setShowNextOverlay(false);
          setResult("");
          setTopPick(null);
          setBotPick(null);
          recordMatchResult(winner);
        }, 1500);
      } else {
        setResult("");
        setTopPick(null);
        setBotPick(null);
        startTimer();
      }
    }, 2000);
  }

  /* ----------- TIMEOUT LOGIC -------------- */
  function handleTimeout(side) {
    clearTimer();

    let newTop = topLives;
    let newBot = botLives;

    if (side === "both") {
      newTop = Math.max(0, topLives - 1);
      newBot = Math.max(0, botLives - 1);
      setTopLives(newTop);
      setBotLives(newBot);
      setTopLifePop(true);
      setBotLifePop(true);
    }

    setTimeoutSide(side);

    setTimeout(() => {
      setTimeoutSide(null);
      setTopPick(null);
      setBotPick(null);

      const matchEnded = newTop === 0 || newBot === 0;

      if (matchEnded) {
        const winner =
          newTop === 0 && newBot === 0
            ? "tie"
            : newBot === 0
            ? "win"
            : "lose";

        if (winner === "win") {
          setEarnTop((e) => e + payoutPerRound);
        } else if (winner === "lose") {
          setEarnBot((e) => e + payoutPerRound);
        }

        setShowNextOverlay(true);
        setTimeout(() => {
          setShowNextOverlay(false);
          setResult("");
          recordMatchResult(winner);
        }, 1500);
      } else {
        startTimer();
      }
    }, 1800);
  }

  /* ----------- MATCH ADVANCE -------------- */
  function recordMatchResult(outcome) {
    setMatchResults((prev) => {
      const copy = [...prev];
      copy[matchIndex - 1] = outcome;
      return copy;
    });

    const next = matchIndex + 1;
    next > MATCHES_TOTAL ? finishMatch() : startMatch(next);
  }

  async function finishMatch() {
    clearTimer();
    navigate("/dev-arena");
  }

  /* ------------ SMALL UI HELPERS ---------- */
  function LifeDots({ count }) {
    return (
      <div className="player-lights">
        {Array.from({ length: LIVES }).map((_, i) => (
          <div key={i} className={"life-dot " + (i < count ? "on" : "off")} />
        ))}
      </div>
    );
  }

  function TimerRing({ seconds }) {
    const size = 42;
    const stroke = 4;
    const r = (size - stroke) / 2;
    const C = 2 * Math.PI * r;
    const pct = Math.max(0, seconds / ROUND_TIME);

    return (
      <svg className="timer-ring" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(0,255,213,.15)"
          strokeWidth={stroke}
          fill="none"
        />
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
        <text x="50%" y="54%" textAnchor="middle" className="timer-text">
          {Math.max(0, seconds)}
        </text>
      </svg>
    );
  }

  function NESButton({ move, onClick, active, ghost }) {
    return (
      <motion.button
        onClick={ghost ? undefined : () => onClick(move)}
        disabled={ghost}
        whileTap={ghost ? undefined : { scale: 0.92 }}
        className={
          "nes-button " +
          (ghost ? "nes-button-ghost" : "") +
          (active ? " nes-button-active" : "")
        }
      >
        {HAND[move]}
      </motion.button>
    );
  }

  /* ------------ RENDER HELPERS ------------ */

  const bottomResult =
    result === "win" ? "lose" : result === "lose" ? "win" : result;

  const topResultClass =
    result === "win"
      ? "win"
      : result === "lose"
      ? "lose"
      : result === "tie"
      ? "tie"
      : "";

  const bottomResultClass =
    bottomResult === "win"
      ? "win"
      : bottomResult === "lose"
      ? "lose"
      : bottomResult === "tie"
      ? "tie"
      : "";

  /* ----------------- RENDER --------------- */

  return (
    <div className="arena-page">
      <div className="arena-frame">
        {/* INTRO OVERLAY */}
        <AnimatePresence>
          {showIntro && (
            <motion.div
              key="intro"
              className="intro-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                className="intro-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="intro-card-title">
                  {pass?.tier || "MATCH"}
                </div>
                <div className="intro-card-sub">Selected</div>
                <div className="intro-card-rounds">
                  $ {payoutPerRound.toFixed(2)} per win
                </div>
                <div className="intro-card-rounds">
                  {MATCHES_TOTAL} matches total
                </div>
                <div className="intro-card-goodluck">Good luck!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DIVIDER */}
        <div className="arena-divider" />

        {/* ROUND BANNER */}
        <AnimatePresence>
          {showRoundBanner && !showIntro && (
            <motion.div
              className="round-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
            >
              {roundLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FINAL ROUND BADGE */}
        <AnimatePresence>
          {showFinalBanner && !showRoundBanner && !showIntro && (
            <motion.div
              className="final-round-badge"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              Final Round!
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP PLAYER */}
        <div className="player-top">
          <div className="player-name">
            {user?.email?.split("@")[0] || "You"}
          </div>

          <div className="player-winnings">
            Winnings: ${earnTop.toFixed(2)}
          </div>

          <div className="player-lights">
            <LifeDots count={topLives} />
            <TimerRing seconds={t} />
          </div>

          <AnimatePresence>
            {topLifePop && (
              <motion.div
                className="life-pop"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -18 }}
                exit={{ opacity: 0, y: -26 }}
                transition={{ duration: 0.45 }}
              >
                -1 Life
              </motion.div>
            )}
          </AnimatePresence>

          <div className="player-moves">
            {MOVES.map((m) => (
              <motion.div
                key={`t-${m}`}
                animate={
                  topPick === m
                    ? { scale: [1, 1.25, 1.15, 1.2], opacity: 1 }
                    : { scale: 1, opacity: 0.85 }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <NESButton
                  move={m}
                  onClick={onTopPick}
                  active={topPick === m}
                  ghost={disabled}
                />
              </motion.div>
            ))}
          </div>

          <div className="player-select-indicator">
            <div
              className={
                "player-select-dot " + (topPick ? "active" : "inactive")
              }
            />
            <div className="player-select-label">Selected</div>
          </div>

          {result && (
            <div
              className={`result-box top ${topResultClass} ${
                result ? "show" : ""
              }`}
            >
              {topResultClass.toUpperCase()}
            </div>
          )}
        </div>

        {/* TOP TIMEOUT */}
        <AnimatePresence>
          {timeoutSide === "both" && (
            <motion.div
              className="player-timeout player-timeout-top"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              Timed Out!
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM PLAYER */}
        <div className="player-bottom">
          <div
            className="player-select-indicator"
            style={{ marginBottom: 4 }}
          >
            <div
              className={
                "player-select-dot " + (botPick ? "active" : "inactive")
              }
            />
            <div className="player-select-label">Selected</div>
          </div>

          <div className="player-moves" style={{ marginBottom: 10 }}>
            {MOVES.map((m) => (
              <motion.div
                key={`b-${m}`}
                animate={
                  botPick === m
                    ? { scale: [1, 1.25, 1.15, 1.2], opacity: 1 }
                    : { opacity: 0.25, scale: 1 }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ perspective: 600 }}
              >
                <NESButton move={m} ghost active={botPick === m} />
              </motion.div>
            ))}
          </div>

          <div className="player-lights" style={{ marginBottom: 4 }}>
            <LifeDots count={botLives} />
            <TimerRing seconds={t} />
          </div>

          <AnimatePresence>
            {botLifePop && (
              <motion.div
                className="life-pop"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -18 }}
                exit={{ opacity: 0, y: -26 }}
                transition={{ duration: 0.5 }}
              >
                -1 Life
              </motion.div>
            )}
          </AnimatePresence>

          <div className="player-winnings" style={{ marginBottom: 8 }}>
            Winnings: ${earnBot.toFixed(2)}
          </div>

          <div className="player-name">Opponent</div>

          {result && (
            <div
              className={`result-box bottom ${bottomResultClass} ${
                result ? "show" : ""
              }`}
            >
              {bottomResultClass.toUpperCase()}
            </div>
          )}
        </div>

        {/* BOTTOM TIMEOUT */}
        <AnimatePresence>
          {timeoutSide === "both" && (
            <motion.div
              className="player-timeout player-timeout-bottom"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5 }}
            >
              Timed Out!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// src/components/DevArena.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { api } from "../services/api";
import "./DevArena.css";
import { doc, onSnapshot } from "firebase/firestore";

export default function DevArena() {
  const navigate = useNavigate();

  /* ----------------------------------
     WEEKLY PRIZE — LIVE FIRESTORE LISTENER
  ------------------------------------- */
  const [weeklyPrize, setWeeklyPrize] = useState(0);

  useEffect(() => {
    const ref = doc(db, "meta", "weeklyPrize");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const amt = snap.data().amount;
        setWeeklyPrize(typeof amt === "number" ? amt : 0);
      }
    });
    return () => unsub();
  }, []);

  /* ----------------------------------
     COUNTDOWN HELPERS
  ------------------------------------- */
  function getNextSundayAt20() {
    const now = new Date();
    const day = now.getDay();
    let daysUntilSunday = (7 - day) % 7;

    const afterEightTonight =
      now.getHours() > 20 ||
      (now.getHours() === 20 && now.getMinutes() >= 0);

    if (daysUntilSunday === 0 && afterEightTonight) {
      daysUntilSunday = 7;
    }

    const target = new Date(now);
    target.setDate(now.getDate() + daysUntilSunday);
    target.setHours(20, 0, 0, 0);
    return target;
  }

  function diffToParts(target) {
    const now = new Date();
    const ms = Math.max(0, target - now);
    const totalSeconds = Math.floor(ms / 1000);

    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }

  /* ----------------------------------
     DEFAULT TOP 5 (fallback)
  ------------------------------------- */
  const DEFAULT_STREAKS = [
    { rank: 1, name: "NeonNinja", wins: 18 },
    { rank: 2, name: "RPSKing", wins: 15 },
    { rank: 3, name: "PaperTiger", wins: 13 },
    { rank: 4, name: "ScissorQueen", wins: 11 },
    { rank: 5, name: "VaultCrusher", wins: 10 },
  ];

  const PASSES = [
    { id: "rookie", label: "Rookie", price: "$2.00 per win" },
    { id: "pro", label: "Pro", price: "$3.00 per win" },
    { id: "elite", label: "Elite", price: "$4.00 per win" },
  ];

  /* ----------------------------------
     LIVE COUNTDOWN CLOCK
  ------------------------------------- */
  const [timeLeft, setTimeLeft] = useState(() =>
    diffToParts(getNextSundayAt20())
  );

  const { days, hours, minutes, seconds } = timeLeft;

  useEffect(() => {
    const target = getNextSundayAt20();
    const id = setInterval(() => {
      setTimeLeft(diffToParts(target));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ----------------------------------
     LIVE LEADERBOARD LOAD
  ------------------------------------- */
  const [streaks, setStreaks] = useState(DEFAULT_STREAKS);

  useEffect(() => {
    let cancelled = false;

    async function loadStreaks() {
      try {
        const res = await api("/dev/longest-streak");

        if (!cancelled && res && Array.isArray(res.streaks)) {
          setStreaks(res.streaks);
        }
      } catch (_) {
        setStreaks(DEFAULT_STREAKS);
      }
    }

    loadStreaks();
    return () => (cancelled = true);
  }, []);

  /* ----------------------------------
     PROFILE BUTTON
  ------------------------------------- */
  const goProfile = () => {
    if (!auth.currentUser) {
      navigate("/auth?redirect=dev-arena");
    } else {
      navigate("/profile");
    }
  };

  /* ----------------------------------
     RENDER
  ------------------------------------- */

  return (
    <div className="dev-arena">
      {/* TITLE */}
      <h2 className="lsr-title">LONGEST STREAK REWARD!</h2>

      {/* TOP ROW */}
      <div className="lsr-top-row">

        {/* Profile Button */}
        <button className="lsr-profile-btn" onClick={goProfile}>
          Profile
        </button>

        {/* Prize Box */}
        <div className="lsr-prize-card">
          <div className="lsr-prize-label">WEEKLY TOURNAMENT PRIZE</div>
          <div className="lsr-prize-amount">
            ${(Number(weeklyPrize) || 0).toFixed(2)}
          </div>
          <div className="lsr-prize-sub">
            Highest streak in any bracket wins the bonus.
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lsr-streaks-card">
          <div className="lsr-streaks-header">Top 5 Streaks This Week</div>
          <div className="lsr-streaks-list">
            {streaks.map((row) => (
              <div className="lsr-streak-row tight" key={row.rank}>
                <span className="lsr-streak-rank">#{row.rank}</span>
                <span className="lsr-streak-name">{row.name}</span>
                <span className="lsr-streak-wins">{row.wins}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COUNTDOWN */}
      <div className="lsr-countdown-section">
        <div className="lsr-payout-line">
          PAID OUT EVERY SUNDAY AT 8:00 P.M.!
        </div>

        <div className="lsr-countdown-boxes">
          <div className="lsr-countdown-box">
            <div className="lsr-count-number">
              {String(days).padStart(2, "0")}
            </div>
            <div className="lsr-count-label">DAYS</div>
          </div>

          <div className="lsr-countdown-box">
            <div className="lsr-count-number">
              {String(hours).padStart(2, "0")}
            </div>
            <div className="lsr-count-label">HOURS</div>
          </div>

          <div className="lsr-countdown-box">
            <div className="lsr-count-number">
              {String(minutes).padStart(2, "0")}
            </div>
            <div className="lsr-count-label">MINUTES</div>
          </div>

          <div className="lsr-countdown-box">
            <div className="lsr-count-number">
              {String(seconds).padStart(2, "0")}
            </div>
            <div className="lsr-count-label">SECONDS</div>
          </div>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <div className="lsr-instruction lsr-instruction-large">
        Click <span className="lsr-highlight">Profile</span>. Choose a game pass. Come back to play.
      </div>

      {/* GAME PASSES */}
      <div className="lsr-pass-row">
        {PASSES.map((pass) => (
          <div key={pass.id} className="lsr-pass-card">
            <div className="lsr-pass-header">{pass.label}</div>
            <div className="lsr-pass-price">10 rounds. {pass.price}</div>

            <div className="lsr-pass-footer">
              <button
                className="lsr-pass-button"
                onClick={() => navigate("/match-arena", { state: { passId: pass.id } })}
                   >
               Play Now
             </button>
             </div>

          </div>
        ))}
      </div>
    </div>
  );
}

// src/pages/DevArena.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";

function getNextSundayAt20() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const daysUntilSunday = (7 - day) % 7;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntilSunday);
  target.setHours(20, 0, 0, 0); // 8:00 p.m.

  // If it's already past this Sunday's 8pm, go to next week
  if (target <= now) {
    target.setDate(target.getDate() + 7);
  }
  return target;
}

function useCountdown() {
  const [target] = useState(getNextSundayAt20);
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(computeTimeLeft(target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

useEffect(() => {
  let cancelled = false;

  async function loadLeaderboard() {
    try {
      const data = await api("/lsw/leaderboard");
      if (cancelled) return;

      if (data && Array.isArray(data.top5) && data.top5.length > 0) {
        setLeaderboard(data.top5);
      } else {
        console.log("Leaderboard empty, using defaults");
      }
    } catch (err) {
      console.error("Failed to load LSW leaderboard:", err);
      // fall back to defaults
    } finally {
      if (!cancelled) {
        setLoadingLb(false);
      }
    }
  }

  loadLeaderboard();
  return () => {
    cancelled = true;
  };
}, []);

function computeTimeLeft(target) {
  const now = new Date();
  let diff = target - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

const sampleLeaderboard = [
  { username: "NeonNinja", streak: 18 },
  { username: "RPSKing", streak: 15 },
  { username: "PaperTiger", streak: 13 },
  { username: "ScissorQueen", streak: 11 },
  { username: "VaultCrusher", streak: 10 },
];

const defaultLeaderboard = [
  { username: "NeonNinja", streak: 18 },
  { username: "RPSKing", streak: 15 },
  { username: "PaperTiger", streak: 13 },
  { username: "ScissorQueen", streak: 11 },
  { username: "VaultCrusher", streak: 10 },
];


export default function DevArena() {
  // Fake player data – later we can wire this to real backend
  const [player, setPlayer] = useState({
    username: "PlayerUN",
    rank: "Silver II",
    avatarEmoji: "🎮",
    longestStreakEver: 22,
    weeklyLongestStreak: 9,
    totalWinnings: 36.5,
    vaultBalance: 27.25,
    gamesLeftRookie: 4,
    gamesLeftPro: 0,
    gamesLeftElite: 0,
    totalGamesPlayed: 143,
    totalWins: 81,
    totalLosses: 62,
  });

  const [leaderboard, setLeaderboard] = useState(defaultLeaderboard);
  const [loadingLb, setLoadingLb] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null);
  const countdown = useCountdown();

  const winRate =
    player.totalGamesPlayed > 0
      ? Math.round((player.totalWins / player.totalGamesPlayed) * 100)
      : 0;

  const canUseRookie = player.vaultBalance >= 10;
  const canUsePro = player.vaultBalance >= 15;
  const canUseElite = player.vaultBalance >= 20;
  const canCashOut = player.totalWinnings >= 50;

  function handlePlayClick(tier) {
    if (
      (tier === "rookie" && !canUseRookie) ||
      (tier === "pro" && !canUsePro) ||
      (tier === "elite" && !canUseElite)
    ) {
      return;
    }

    // Simple fake opponent until we wire it to your real arena
    const opponents = ["LuckyLizard", "SharpRock", "PaperStorm", "NeonBlade"];
    const opponent =
      opponents[Math.floor(Math.random() * opponents.length)] || "Opponent";

    setMatchInfo({
      tier,
      opponent,
    });
  }

  function closeMatchOverlay() {
    setMatchInfo(null);
  }

  function formatCountdownPart(label, value) {
    const padded = value.toString().padStart(2, "0");
    return (
      <div className="dev-count-box" key={label}>
        <div className="dev-count-value">{padded}</div>
        <div className="dev-count-label">{label}</div>
      </div>
    );
  }

  return (
    <div className="dev-arena-page">
      {/* Slide-out profile tab */}
      <div className={`dev-profile-drawer ${profileOpen ? "open" : ""}`}>
        <button
          className="dev-profile-toggle"
          onClick={() => setProfileOpen((x) => !x)}
        >
          {profileOpen ? "⮌ Close Profile" : "☰ Player Profile"}
        </button>

        <div className="dev-profile-inner">
          <div className="dev-profile-header">
            <div className="dev-avatar-circle">
              <span>{player.avatarEmoji}</span>
            </div>
            <div>
              <div className="dev-profile-name">{player.username}</div>
              <div className="dev-profile-rank">{player.rank}</div>
            </div>
          </div>

          <div className="dev-profile-grid">
            <div className="dev-profile-card">
              <h4>Vault</h4>
              <div className="dev-vault-amount">${player.vaultBalance.toFixed(2)}</div>
              <div className="dev-vault-sub">Total winnings available</div>

              <div className="dev-pass-buttons">
                <button
                  className={`dev-pass-btn ${canUseRookie ? "active" : "locked"}`}
                  disabled={!canUseRookie}
                >
                  Rookie Pass
                  <span className="dev-pass-sub">Unlocks at $10</span>
                </button>
                <button
                  className={`dev-pass-btn ${canUsePro ? "active" : "locked"}`}
                  disabled={!canUsePro}
                >
                  Pro Pass
                  <span className="dev-pass-sub">Unlocks at $15</span>
                </button>
                <button
                  className={`dev-pass-btn ${canUseElite ? "active" : "locked"}`}
                  disabled={!canUseElite}
                >
                  Elite Pass
                  <span className="dev-pass-sub">Unlocks at $20</span>
                </button>
              </div>

              <button
                className={`dev-cashout-btn ${
                  canCashOut ? "dev-cashout-ready" : "dev-cashout-locked"
                }`}
                disabled={!canCashOut}
              >
                {canCashOut
                  ? "Cash Out (minimum $50)"
                  : "Cash out unlocked at $50+"}
              </button>
            </div>

            <div className="dev-profile-card">
              <h4>Game Pass Balance</h4>
              <div className="dev-pass-count-row">
                <span>Rookie Games Left</span>
                <span>{player.gamesLeftRookie}</span>
              </div>
              <div className="dev-pass-count-row">
                <span>Pro Games Left</span>
                <span>{player.gamesLeftPro}</span>
              </div>
              <div className="dev-pass-count-row">
                <span>Elite Games Left</span>
                <span>{player.gamesLeftElite}</span>
              </div>
              <div className="dev-pass-note">
                Each game pass grants 10 games in its bracket.
              </div>
            </div>

            <div className="dev-profile-card">
              <h4>Lifetime Stats</h4>
              <div className="dev-stat-row">
                <span>Longest streak ever</span>
                <span>{player.longestStreakEver}</span>
              </div>
              <div className="dev-stat-row">
                <span>Longest streak this week</span>
                <span>{player.weeklyLongestStreak}</span>
              </div>
              <div className="dev-stat-row">
                <span>Total games played</span>
                <span>{player.totalGamesPlayed}</span>
              </div>
              <div className="dev-stat-row">
                <span>Total wins</span>
                <span>{player.totalWins}</span>
              </div>
              <div className="dev-stat-row">
                <span>Win rate</span>
                <span>{winRate}%</span>
              </div>
              <div className="dev-stat-row">
                <span>Total winnings</span>
                <span>${player.totalWinnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="dev-arena-main">
        {/* Longest Streak Reward banner */}
        <section className="dev-lsw-section">
          <div className="dev-lsw-caption-top">Longest Streak Reward!</div>

          <div className="dev-lsw-prize-panel">
            <div className="dev-lsw-glow"></div>
            <div className="dev-lsw-content">
              <div className="dev-lsw-label">Weekly Tournament Prize</div>
              {/* You can change this to whatever TDC amount you want */}
              <div className="dev-lsw-amount">$250 TDC</div>
              <div className="dev-lsw-sub">
                Highest streak in any bracket wins the bonus.
              </div>
            </div>
          </div>

          <div className="dev-lsw-caption-bottom">
            Paid out every Sunday at 8:00 p.m.!
          </div>

          {/* Countdown */}
          <div className="dev-countdown-row">
            {formatCountdownPart("Days", countdown.days)}
            {formatCountdownPart("Hours", countdown.hours)}
            {formatCountdownPart("Minutes", countdown.minutes)}
            {formatCountdownPart("Seconds", countdown.seconds)}
          </div>
        </section>

        {/* Leaderboard + play section */}
        <section className="dev-arena-grid">
          {/* Leaderboard */}
          <div className="dev-card dev-leaderboard">
            <h3>Live Longest Streak Tracker (Top 5)</h3>
            <ul className="dev-leader-list">
              {leaderboard.map((row, idx) => (
                <li key={row.username} className="dev-leader-row">
                  <span className="dev-leader-rank">#{idx + 1}</span>
                  <span className="dev-leader-name">{row.username}</span>
                  <span className="dev-leader-streak">
                    {row.streak} win{row.streak === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="dev-leader-sub">
              Streaks reset every Sunday at 8:00 p.m. Keep your run alive!
            </div>
          </div>

          {/* Game selection + main arena controls */}
          <div className="dev-card dev-play-grid">
            <h3>Jump into the Arena</h3>
            <p className="dev-play-sub">
              Pick your bracket. Your unlocked tiers glow neon — locked tiers
              stay dim until your Vault balance hits the requirement.
            </p>

            <div className="dev-play-tiles">
              <PlayTile
                tierId="rookie"
                name="Rookie"
                entry="$3 + Rookie Pass"
                requirement="$10 Vault to rebuy using winnings"
                unlocked={canUseRookie}
                onPlay={handlePlayClick}
              />
              <PlayTile
                tierId="pro"
                name="Pro"
                entry="$3 + Pro Pass"
                requirement="$15 Vault to rebuy using winnings"
                unlocked={canUsePro}
                onPlay={handlePlayClick}
              />
              <PlayTile
                tierId="elite"
                name="Elite"
                entry="$3 + Elite Pass"
                requirement="$20 Vault to rebuy using winnings"
                unlocked={canUseElite}
                onPlay={handlePlayClick}
              />
            </div>

            <div className="dev-extra-notes">
              • Each game you win pushes your streak higher.  
              • Weekly leader wins the Longest Streak Reward.  
              • Use winnings in your Vault to re-enter brackets without paying the
              entry fee again.
            </div>
          </div>
        </section>
      </div>

      {/* Simple match preview overlay */}
      {matchInfo && (
        <div className="dev-match-overlay" onClick={closeMatchOverlay}>
          <div
            className="dev-match-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dev-match-header">
              <span>{matchInfo.tier.toUpperCase()} BRACKET</span>
            </div>
            <div className="dev-match-body">
              <div className="dev-match-player">
                <div className="dev-match-avatar self">🧑</div>
                <div className="dev-match-name">{player.username}</div>
              </div>
              <div className="dev-match-vs">VS</div>
              <div className="dev-match-player">
                <div className="dev-match-avatar">🤖</div>
                <div className="dev-match-name">{matchInfo.opponent}</div>
              </div>
            </div>
            <div className="dev-match-footer">
              <button className="dev-match-btn" onClick={closeMatchOverlay}>
                Start Match (placeholder)
              </button>
              <div className="dev-match-note">
                This is a preview only. We’ll wire this to your real RPS match
                screen.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

{loadingLb && (
  <div className="dev-leader-sub">Loading live leaderboard…</div>
)}


function PlayTile({ tierId, name, entry, requirement, unlocked, onPlay }) {
  return (
    <button
      className={`dev-play-tile ${unlocked ? "unlocked" : "locked"}`}
      disabled={!unlocked}
      onClick={() => onPlay(tierId)}
    >
      <div className="dev-play-name">{name}</div>
      <div className="dev-play-entry">{entry}</div>
      <div className="dev-play-req">{requirement}</div>
      <div className="dev-play-cta">
        {unlocked ? "Play Now" : "Locked – build your Vault"}
      </div>
    </button>
  );
}

// src/components/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import "./profile.css";

const TIER_CONFIG = {
  rookie: {
    id: "rookie",
    label: "ROOKIE",
    cardDisplay: "$9.99 + $3",
    vaultCost: 10,
    payoutPerWin: 2,
  },
  pro: {
    id: "pro",
    label: "PRO",
    cardDisplay: "$14.99 + $3",
    vaultCost: 15,
    payoutPerWin: 3,
  },
  elite: {
    id: "elite",
    label: "ELITE",
    cardDisplay: "$19.99 + $3",
    vaultCost: 20,
    payoutPerWin: 4,
  },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyBusy, setBuyBusy] = useState(false);
  const [cashoutBusy, setCashoutBusy] = useState(false);

  /* -------------------------------------------------
     LOAD PROFILE
  --------------------------------------------------- */
  async function loadProfile() {
    try {
      setLoading(true);
      const data = await api("/profile");
      setProfile(data);
    } catch (err) {
      console.error("Profile load error", err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  /* -------------------------------------------------
     LOG OUT
  --------------------------------------------------- */
  async function handleLogout() {
    try {
      await api("/auth/logout", { method: "POST" });
      window.location.href = "/auth"; // redirect to login
    } catch (err) {
      console.error("Logout failed", err);
      setError("Could not log out.");
    }
  }

  /* -------------------------------------------------
     IF STILL LOADING
  --------------------------------------------------- */
  if (loading || !profile) {
    return <div className="loading">Loading...</div>;
  }

  /* -------------------------------------------------
     BUY / REBUY PASS
  --------------------------------------------------- */
  async function handleBuy(tierId, method) {
    try {
      setBuyBusy(true);
      setError("");

      await api("/player/rebuy", {
        method: "POST",
        body: { method },
      });

      await loadProfile();
    } catch (err) {
      console.error("Rebuy error", err);
      setError("Could not process that purchase.");
    } finally {
      setBuyBusy(false);
    }
  }

  /* -------------------------------------------------
     CASH OUT
  --------------------------------------------------- */
  async function handleCashout() {
    if ((profile.vault ?? 0) < 50) return;

    try {
      setCashoutBusy(true);
      setError("");

      await api("/player/cashout", {
        method: "POST",
        body: {},
      });

      await loadProfile();
    } catch (err) {
      console.error("Cashout error", err);
      setError("Cashout failed.");
    } finally {
      setCashoutBusy(false);
    }
  }

  /* -------------------------------------------------
     SAFE VALUES
  --------------------------------------------------- */
  const vault = Number(profile.vault || 0);
  const canCashout = vault >= 50;

  const matchRecap = Array.isArray(profile.recentMatches)
    ? profile.recentMatches
    : [];

  const tierCfg = TIER_CONFIG[profile.tier] || TIER_CONFIG.rookie;

  /* -------------------------------------------------
     RENDER
  --------------------------------------------------- */
  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header-row">
        <div className="profile-avatar">
          {(profile.username || "P").slice(0, 1).toUpperCase()}
        </div>
        <div className="profile-header-text">
          <div className="profile-username">{profile.username || "Player"}</div>
        </div>
      </div>

      {/* PLAYER STATS */}
      <section className="profile-card stats-card">
        <div className="section-title">Player Stats</div>

        <div className="stats-grid">
          <div className="stat-row">
            <span className="stat-label">Total Earned:</span>
            <span className="stat-value">${profile.lifetimeEarnings?.toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Wins:</span>
            <span className="stat-value">{profile.lifetimeWins}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Win Rate:</span>
            <span className="stat-value">{profile.winRate}%</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Current Streak:</span>
            <span className="stat-value">{profile.currentStreak}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">All-Time Streak:</span>
            <span className="stat-value">{profile.longestStreak}</span>
          </div>
        </div>
      </section>

      {/* VAULT + BUY SECTION */}
      <section className="profile-card vault-card">
        <div className="vault-grid">
          
          {/* BUY WITH CARD */}
          <div className="vault-column">
            <div className="vault-column-title">Buy with card</div>
            {Object.values(TIER_CONFIG).map((tier) => (
              <button
                type="button"
                key={tier.id}
                className="vault-buy-btn card"
                disabled={buyBusy}
                onClick={() => handleBuy(tier.id, "card")}
              >
                <span className="vault-buy-tier">{tier.label}</span>
                <span className="vault-buy-price">{tier.cardDisplay}</span>
              </button>
            ))}
          </div>

          {/* VAULT CENTER */}
          <div className="vault-center">
            <div className="vault-label">Vault Balance</div>
            <div className="vault-balance">${vault.toFixed(2)}</div>

            <button
              type="button"
              className={
                "vault-cashout-btn" +
                (canCashout ? " vault-cashout-ready" : " vault-cashout-locked")
              }
              disabled={!canCashout || cashoutBusy}
              onClick={handleCashout}
            >
              {cashoutBusy ? "Processing..." : "Cash Out"}
            </button>

            <div className="vault-note">($50 required for cashout)</div>
          </div>

          {/* BUY USING VAULT */}
          <div className="vault-column">
            <div className="vault-column-title">Buy with winnings</div>

            {Object.values(TIER_CONFIG).map((tier) => {
              const canAfford = vault >= tier.vaultCost;
              return (
                <button
                  type="button"
                  key={tier.id}
                  className={
                    "vault-buy-btn winnings" +
                    (!canAfford || buyBusy ? " locked" : "")
                  }
                  disabled={!canAfford || buyBusy}
                  onClick={() => handleBuy(tier.id, "vault")}
                >
                  <span className="vault-buy-tier">{tier.label}</span>
                  <span className="vault-buy-price">
                    ${tier.vaultCost} from Vault
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PASS + MATCH RECAP */}
      <div className="profile-bottom-row">

        {/* CURRENT PASS */}
        <section className="profile-card current-pass-card">
          <div className="section-title">Current Pass</div>

          <div className="current-pass-grid">
            <div className="current-pass-row">
              <span className="current-pass-label">Matches remaining:</span>
              <span className="current-pass-value">
                {profile.matchesRemaining} / 10
              </span>
            </div>

            <div className="current-pass-row">
              <span className="current-pass-label">Payout per win:</span>
              <span className="current-pass-value">
                ${profile.payoutPerWin?.toFixed(2)}
              </span>
            </div>

            <div className="current-pass-row">
              <span className="current-pass-label">Format:</span>
              <span className="current-pass-value">Best of 5</span>
            </div>
          </div>
        </section>

        {/* MATCH RECAP */}
        <section className="profile-card recap-card">
          <div className="section-title">Match Recap</div>

          {matchRecap.length === 0 ? (
            <div className="current-pass-empty">No matches played yet.</div>
          ) : (
            <ul className="recap-list">
              {matchRecap.map((m, i) => (
                <li key={i} className="recap-row">
                  <span className="recap-round">R{i + 1}</span>
                  <span className={"recap-result " + (m.result === "W" ? "win" : "loss")}>
                    {m.result}
                  </span>
                  <span className="recap-payout">${m.payout}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>

      {/* FOOTER */}
      <div className="profile-footer">
        <button type="button" className="profile-footer-edit">
          Edit Profile
        </button>

        {/* NEW — Logout button */}
        <button
          type="button"
          className="profile-footer-edit"
          onClick={handleLogout}
          style={{ marginLeft: "12px" }}
        >
          Log Out
        </button>
      </div>

      {error && <div className="profile-error-inline">{error}</div>}
    </div>
  );
}

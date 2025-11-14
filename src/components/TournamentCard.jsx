import React from "react";

export default function TournamentCard({
  name,
  entry,
  topPrize,
  paysRounds,
  count,
  max,
  onJoin,
  disabled,
  extraClass = ""   // ✅ added
}) {
  return (
    <div className={`tier-card ${extraClass} ${disabled ? "tier-disabled" : ""}`}>
      <div className="tier-title">{name} Tournament</div>

<div className="tier-meta">
  <div>Entry: {entry} Tickets or Credits</div>
  <div>Top Prize: ${topPrize}</div>
</div>

<div className="tier-note">
  Every round wins something!
</div>

      <div className="tier-counter">
        Players: {count} / {max}
      </div>

      <button className="btn" disabled={disabled} onClick={onJoin}>
        {disabled ? "In Progress" : "Play Now"}
      </button>
    </div>
  );
}

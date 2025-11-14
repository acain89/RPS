// src/components/PlayerCard.jsx
import React from "react";
import { START_LIVES } from "../constants";

export default function PlayerCard({ match, who, time, choose, lifePopup }) {
  const p = match[who];
  if (!p) return <div className="player-card empty">Waiting…</div>;

  const isLoser = match.finished && match.winner && match.winner !== who;
  const myMove = who === "a" ? match.aMove : match.bMove;
  const waitingForReveal = !!myMove && !match.reveal;
  const revealingNow = !!match.reveal;
  const isObscured = !!myMove && !match.reveal;

  const btnStyle = (move) => {
    const isChosen = myMove === move;
    const scale =
      isChosen && waitingForReveal
        ? "scale(1.5)"
        : isChosen && revealingNow
        ? "scale(1.25)"
        : "scale(1)";

    return {
      transform: scale,
      transition: "transform 180ms ease",
      animation: isChosen && revealingNow ? "rps-shake 380ms ease" : "none",
    };
  };

  return (
    <div className={`player-card ${isLoser ? "loser-fade" : ""}`}>
      {isLoser && <div className="eliminated-stamp">ELIMINATED</div>}

      <div className="pc-head">
        <div className="pc-name">{p.name}</div>
        <div className="pc-timer" data-low={time <= 5}>
          {time}s
        </div>
      </div>

      <div className="pc-lives">
        {Array.from({ length: START_LIVES }, (_, i) => (
          <span
            key={i}
            className={i < START_LIVES - p.lives ? "life lost" : "life"}
          />
        ))}
        {lifePopup && <span className="life-popup">−1</span>}
      </div>

      <div className="pc-controls">
        <button className="rps-btn" style={btnStyle("rock")} onClick={() => choose("rock")}>
          <span className={`btn-emoji ${isObscured && myMove === "rock" ? "obscure" : ""}`}>✊</span>
        </button>
        <button className="rps-btn" style={btnStyle("paper")} onClick={() => choose("paper")}>
          <span className={`btn-emoji ${isObscured && myMove === "paper" ? "obscure" : ""}`}>✋</span>
        </button>
        <button className="rps-btn" style={btnStyle("scissors")} onClick={() => choose("scissors")}>
          <span className={`btn-emoji ${isObscured && myMove === "scissors" ? "obscure" : ""}`}>✌️</span>
        </button>
      </div>

      {/* ✅ Local animation keyframes for the shake */}
      <style>{`
        @keyframes rps-shake {
          0% { transform: scale(1.25) rotate(0deg); }
          25% { transform: scale(1.25) rotate(-6deg); }
          50% { transform: scale(1.25) rotate(6deg); }
          75% { transform: scale(1.25) rotate(-4deg); }
          100% { transform: scale(1.25) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

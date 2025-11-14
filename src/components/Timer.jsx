// src/components/Timer.jsx
import React from "react";
import { useTournament } from "../context/TournamentContext";

export default function Timer() {
  const { round, preTime, phase } = useTournament();

  // Display text based on phase
  let display = "";
  if (phase === "pregame") {
    display = `Tournament starts in ${preTime}s`;
  } else if (phase === "round") {
    display = `Round ${round}`;
  } else if (phase === "complete") {
    display = "Tournament Complete";
  }

  return (
    <div className="timer-box neon-glow">
      <span className="timer-text">{display}</span>
    </div>
  );
}

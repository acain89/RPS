// src/components/HowToPlay.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import "./HowToPlay.css";

export default function HowToPlay() {
  const navigate = useNavigate();

  return (
    <div className="howto-page">
      <motion.div
        className="howto-card"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="howto-header">
          <h1>How to Play</h1>
          <p>Fast, fair, skill-based RPS with cash prizes.</p>
        </div>

        <div className="howto-divider" />

        {/* Objective */}
        <section className="howto-section">
          <h2 className="howto-section-title">
            <span className="howto-tag">Objective</span>
          </h2>
          <p className="howto-text">
            Battle an opponent for 10 <span className="accent">rounds</span> of RPS. Each round wins real money.
          </p>
        </section>

        {/* Match Structure */}
        <section className="howto-section">
          <h2 className="howto-section-title">
            <span className="howto-tag">Match Flow</span>
          </h2>
          <ul className="howto-list">
            <li>
              Each game has <span className="accent">10 rounds</span>.
            </li>
            <li>
              Both players start with{" "}
              <span className="accent">3 lives</span>.
            </li>
            <li>
              Pick your move: <span className="emoji">✊</span>{" "}
              <span className="emoji">✋</span>{" "}
              <span className="emoji">✌️</span>.
            </li>
            <li>
              Lose a clash → you lose{" "}
              <span className="accent">1 life</span>.
            </li>
            <li>
              When a player hits <span className="accent">0 lives</span>, the
              other player wins that round.
            </li>
          </ul>
        </section>


        {/* Earnings */}
        <section className="howto-section">
          <h2 className="howto-section-title">
            <span className="howto-tag">Earnings</span>
          </h2>
          <ul className="howto-list">
            <li>
              CLick on Profile to choose a pass; Rookie, Pro, or Elite.
            </li>
            <li>
              Win $2, $3, or $4 every round for 10 rounds.
            </li>
          </ul>
        </section>

        {/* Quick Tips */}
        <section className="howto-section">
          <h2 className="howto-section-title">
            <span className="howto-tag">Tips</span>
          </h2>
          <ul className="howto-list">
            <li>Don’t rush every pick — watch the timer and your lives.</li>
            <li>Mix up your moves; predictable patterns are easy to punish.</li>
            <li>Protect your last life — one mistake can flip the round.</li>
          </ul>
        </section>

        {/* Actions */}
        <div className="howto-actions">
          <Link to="/dev-arena" className="howto-btn primary">
            Jump Into Arena
          </Link>
                  </div>
      </motion.div>
    </div>
  );
}

// src/hooks/useMatchEngine.js
import { useEffect } from "react";
import { rpsResolve } from "../utils/rps";
import {
  useTournament,
} from "../context/TournamentContext";
import {
  START_LIVES,
  TURN_SECONDS,
  MOVES,
} from "../constants";

export default function useMatchEngine() {
  const {
    phase,
    autoPlay,
    matches,
    setMatches,
    playerTickIntervalRef,
    tieMatch,
    setTieMatch
  } = useTournament();

  // Main timer + resolution loop
  useEffect(() => {
    if (phase !== "round") {
      if (playerTickIntervalRef.current) {
        clearInterval(playerTickIntervalRef.current);
        playerTickIntervalRef.current = null;
      }
      return;
    }

    if (playerTickIntervalRef.current) {
      clearInterval(playerTickIntervalRef.current);
      playerTickIntervalRef.current = null;
    }

    playerTickIntervalRef.current = setInterval(() => {
      const now = Date.now();

      setMatches(prev =>
        prev.map(m => {
          if (m.finished) return m;

          let { aTime, bTime, aMove, bMove, pending, pendingAt } = m;

          // Autoplay for dev mode
          if (autoPlay) {
            if (!aMove) aMove = MOVES[Math.floor(Math.random() * 3)];
            if (!bMove) bMove = MOVES[Math.floor(Math.random() * 3)];
          }

          // Tick countdown clocks
          if (!aMove) aTime = Math.max(0, aTime - 1);
          if (!bMove) bTime = Math.max(0, bTime - 1);

          const aTimeout = aTime === 0 && !aMove;
          const bTimeout = bTime === 0 && !bMove;

          // Handle timeout
          if (aTimeout || bTimeout) {
            const outcome =
              aTimeout && bTimeout
                ? "bothTimeout"
                : aTimeout
                ? "aTimeout"
                : "bTimeout";
            return applyOutcome(
              { ...m, aTime, bTime, aMove, bMove, pending: false, reveal: false },
              outcome
            );
          }

          // Reveal window
          if (aMove && bMove && !pending) {
            return {
              ...m,
              aTime,
              bTime,
              aMove,
              bMove,
              pending: true,
              pendingAt: now,
              reveal: true
            };
          }

          if (pending && now - pendingAt >= 400) {
            const r = rpsResolve(aMove, bMove);
            const outcome = r === 0 ? "tie" : r === 1 ? "aWins" : "bWins";
            return applyOutcome(
              { ...m, aTime, bTime, aMove, bMove, pending: false, reveal: false },
              outcome
            );
          }

          return { ...m, aTime, bTime, aMove, bMove, pending, pendingAt };
        })
      );
    }, 1000);

    return () => {
      if (playerTickIntervalRef.current) {
        clearInterval(playerTickIntervalRef.current);
        playerTickIntervalRef.current = null;
      }
    };
  }, [phase, autoPlay]);

  function applyOutcome(m, outcome) {
    let a = { ...m.a };
    let b = { ...m.b };
    let finished = m.finished;
    let winner = m.winner;
    let lifePopupA = false;
    let lifePopupB = false;

    switch (outcome) {
      case "aWins": b.lives--; lifePopupB = true; break;
      case "bWins": a.lives--; lifePopupA = true; break;
      case "aTimeout": a.lives--; lifePopupA = true; break;
      case "bTimeout": b.lives--; lifePopupB = true; break;
      case "bothTimeout": a.lives--; b.lives--; lifePopupA = true; lifePopupB = true; break;
      case "tie":
        setTieMatch(m.id);
        setTimeout(() => setTieMatch(null), 1000);
        break;
    }

    // Clamp
    a.lives = Math.max(0, a.lives);
    b.lives = Math.max(0, b.lives);

    if (a.lives === 0 || b.lives === 0) {
      finished = true;
      winner = a.lives === 0 && b.lives === 0
        ? (Math.random() < 0.5 ? "a" : "b")
        : a.lives === 0
        ? "b"
        : "a";
    }

    return {
      ...m,
      a,
      b,
      aMove: null,
      bMove: null,
      aTime: finished ? m.aTime : TURN_SECONDS,
      bTime: finished ? m.bTime : TURN_SECONDS,
      finished,
      winner,
      lifePopupA,
      lifePopupB,
      pending: false,
      reveal: false
    };
  }
}

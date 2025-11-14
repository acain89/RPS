// src/hooks/useRoundAdvance.js
import { useEffect } from "react";
import { useTournament } from "../context/TournamentContext";
import { TOTAL_PLAYERS, START_LIVES } from "../constants";
import { pairStrict } from "../utils/rps";


export default function useRoundAdvance() {
  const {
    phase, setPhase,
    round, setRound,
    matches, setMatches,
    participants, setParticipants,
    setRoundBanner,
    playerTickIntervalRef,
  } = useTournament();

  useEffect(() => {
    if (phase !== "round") return;

    const allDone = matches.length > 0 && matches.every((m) => m.finished);
    if (!allDone) return;

    // stop timers
    if (playerTickIntervalRef.current) {
      clearInterval(playerTickIntervalRef.current);
      playerTickIntervalRef.current = null;
    }

    // find winners
    const winners = matches.map((m) => m.winnerObj).filter(Boolean);
    if (winners.length <= 1) {
      setPhase("complete");
      return;
    }

    // next round players
    const nextRoundPlayers = winners.map((w) => ({
      ...w,
      lives: START_LIVES,
    }));

    setParticipants(nextRoundPlayers);
    setRound((r) => r + 1);

    const nextPairs = pairStrict(nextRoundPlayers).map(([a, b], idx) => ({
      id: `r${round + 1}-m${idx + 1}`,
      a, b,
      aMove: null, bMove: null,
      aTime: 30, bTime: 30,
      livesA: START_LIVES, livesB: START_LIVES,
      finished: false,
      winner: null,
      reveal: false,
    }));

    setMatches(nextPairs);

    setRoundBanner(`Round ${round + 1}`);
    setTimeout(() => setRoundBanner(""), 3000);
  }, [phase, matches]);
}

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { PRE_TIMER, TOTAL_PLAYERS, START_LIVES, TURN_SECONDS } from "../constants";
import { notifyCountdownStart } from "../utils/notifications"; 
import { pairStrict } from "../utils/rps";




const TournamentContext = createContext(null);

export function TournamentProvider({ children }) {
  // ===== Tournament state =====
  const [phase, setPhase] = useState("pregame");
  const [round, setRound] = useState(1);
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [queueCount, setQueueCount] = useState(0);
  const [roundBanner, setRoundBanner] = useState("");
  const [tieMatch, setTieMatch] = useState(null);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [preTime, setPreTime] = useState(30);
  const [champion, setChampion] = useState(null);

  const [termsOpen, setTermsOpen] = useState(false);
  const [rowToast, setRowToast] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // ===== Timer refs =====
  const pregameIntervalRef = useRef(null);
  const queuePollTimeoutRef = useRef(null);
  const roundBannerTimeoutRef = useRef(null);
  const playerTickIntervalRef = useRef(null);

  const value = {
    phase, setPhase,
    round, setRound,
    participants, setParticipants,
    matches, setMatches,
    queueCount, setQueueCount,
    roundBanner, setRoundBanner,
    tieMatch, setTieMatch,
    countdownStarted, setCountdownStarted,
    preTime, setPreTime,
    champion, setChampion,
    termsOpen, setTermsOpen,
    rowToast, setRowToast,
    showAuth, setShowAuth,
    showOnlyMine, setShowOnlyMine,

    // Refs
    pregameIntervalRef,
    queuePollTimeoutRef,
    roundBannerTimeoutRef,
    playerTickIntervalRef,
  };

// ==== Pregame queue + countdown engine ====
useEffect(() => {
  if (phase !== "pregame") {
    if (queuePollTimeoutRef.current) clearTimeout(queuePollTimeoutRef.current);
    return;
  }

  async function pollQueue() {
    try {
      const data = await api(`/queue-count`);
      const count = Number(data?.count || 0);
      setQueueCount(count);

      const useCount = Math.min(count, TOTAL_PLAYERS);
      setParticipants(
        Array.from({ length: useCount }, (_, i) => ({
          id: i + 1,
          name: `Player ${i + 1}`,
        }))
      );

      // ✅ Start countdown at 64
      if (!countdownStarted && count >= TOTAL_PLAYERS) {
        setCountdownStarted(true);
        notifyCountdownStart();
        let t = PRE_TIMER;
        setPreTime(t);

        if (pregameIntervalRef.current)
          clearInterval(pregameIntervalRef.current);

        pregameIntervalRef.current = setInterval(() => {
          t -= 1;
          setPreTime(t);

          if (t <= 0) {
            clearInterval(pregameIntervalRef.current);
            pregameIntervalRef.current = null;

            setParticipants(
              Array.from({ length: TOTAL_PLAYERS }, (_, i) => ({
                id: i + 1,
                name: `Player ${i + 1}`,
              }))
            );

            setPhase("round");
            setRound(1);

            if (roundBannerTimeoutRef.current)
              clearTimeout(roundBannerTimeoutRef.current);

            setRoundBanner(`Round 1`);
            roundBannerTimeoutRef.current = setTimeout(
              () => setRoundBanner(""),
              3000
            );
          }
        }, 1000);

        return;
      }
    } catch {}

    // keep polling
    queuePollTimeoutRef.current = setTimeout(pollQueue, 1000);
  }

  pollQueue();
  return () => {
    if (queuePollTimeoutRef.current) clearTimeout(queuePollTimeoutRef.current);
  };
}, [phase, countdownStarted]);

// ===== Build matches at the start of each round =====
useEffect(() => {
  if (phase !== "round") return;

  const entrants = participants.slice(0, TOTAL_PLAYERS);
  const ms = pairStrict(entrants).map((pair, i) => ({
    id: `r${round}m${i + 1}`,
    a: { ...pair[0], lives: START_LIVES },
    b: { ...pair[1], lives: START_LIVES },
    aMove: null,
    bMove: null,
    aTime: TURN_SECONDS,
    bTime: TURN_SECONDS,
    finished: false,
    winner: null,
    lifePopupA: false,
    lifePopupB: false,
    pending: false,
    pendingAt: 0,
    reveal: false,
  }));

  setMatches(ms);

  // Round banner
  if (roundBannerTimeoutRef.current) {
    clearTimeout(roundBannerTimeoutRef.current);
  }

  setRoundBanner(`Round ${round}`);

  roundBannerTimeoutRef.current = setTimeout(() => {
    setRoundBanner((current) =>
      current === `Round ${round}` ? "" : current
    );
  }, 3000);
}, [phase, round, participants]);


  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

export const useTournament = () => useContext(TournamentContext);

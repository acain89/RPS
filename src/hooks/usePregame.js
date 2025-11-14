import { useEffect } from "react";
import { api } from "../services/api";
import {
  TOTAL_PLAYERS,
  PRE_TIMER
} from "../constants";
import { useTournament } from "../context/TournamentContext";

export default function usePregame() {
  const {
    phase,
    setPhase,
    participants,
    setParticipants,
    queueCount,
    setQueueCount,
    countdownStarted,
    setCountdownStarted,
    preTime,
    setPreTime,
    round,
    setRound,
    roundBanner,
    setRoundBanner,
    pregameIntervalRef,
    queuePollTimeoutRef,
    roundBannerTimeoutRef
  } = useTournament();

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

        if (!countdownStarted && count >= TOTAL_PLAYERS) {
          setCountdownStarted(true);
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

      queuePollTimeoutRef.current = setTimeout(pollQueue, 1000);
    }

    pollQueue();
    return () => {
      if (queuePollTimeoutRef.current) clearTimeout(queuePollTimeoutRef.current);
    };
  }, [phase, countdownStarted]);
}

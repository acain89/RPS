// RPS32 Battle-Royale Engine (bots simulation)
// - Everyone plays each round (random pairings)
// - 3 lives per player; lose 1 life on loss; out at 0
// - Deterministic RNG via seed
// - Emits events:
//   "tournament_start", "countdown_begin", "tick",
//   "matches" (with aMove/bMove/result), "round_start", "move_tick",
//   "round_end", "tournament_end", "stopped"

export function createRpsEngine(config = {}) {
  const cfg = {
    size: config.size ?? 32,
    lives: config.lives ?? 3,
    roundTimeMs: config.roundTimeMs ?? 6000,  // pre-round countdown
    moveTimeMs: config.moveTimeMs ?? 20000,   // 20s move clock
    seed: config.seed ?? 12345,
    names: config.names ?? [],
  };

  // --- seeded RNG (xorshift32)
  let seed = (cfg.seed >>> 0) || 1;
  const rand = () => {
    seed ^= seed << 13; seed >>>= 0;
    seed ^= seed >>> 17; seed >>>= 0;
    seed ^= seed << 5;  seed >>>= 0;
    return (seed >>> 0) / 0xFFFFFFFF;
  };

  // --- helpers
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const MOVES = ["rock", "paper", "scissors"];
  const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
  const decideMove = () => MOVES[Math.floor(rand() * 3)];

  // --- engine state
  const state = {
    status: "idle", // idle | countdown | playing | done
    round: 0,
    players: [],
    pairings: [], // [{aId,bId,aMove,bMove,result:'a'|'b'|'tie'}]
    winnerId: null,
    countdownMs: 0,
    moveMs: 0,
  };

  // Build players
  for (let i = 0; i < cfg.size; i++) {
    state.players.push({
      id: `P${i + 1}`,
      name: cfg.names[i] || `Player ${i + 1}`,
      lives: cfg.lives,
      out: false,
      isBot: true,
      lastMove: null,
    });
  }

  // --- pub/sub
  const listeners = new Set();
  function emit(type, payload) {
    listeners.forEach((fn) => {
      try { fn({ type, payload, state }); } catch {}
    });
  }

  let timer = null;

  function start() {
    if (state.status !== "idle" && state.status !== "done") return;
    state.status = "countdown";
    state.round = 0;
    state.winnerId = null;
    state.countdownMs = cfg.roundTimeMs;
    emit("tournament_start", {});
    emit("countdown_begin", { round: 1, ms: state.countdownMs });

    clearInterval(timer);
    timer = setInterval(() => {
      state.countdownMs -= 1000;
      emit("tick", { ms: state.countdownMs });
      if (state.countdownMs <= 0) {
        clearInterval(timer);
        playOneRound();
      }
    }, 1000);
  }

  function stop() {
    clearInterval(timer);
    state.status = "idle";
    emit("stopped", {});
  }

  const activePlayers = () => state.players.filter((p) => !p.out);

  function playOneRound() {
    if (state.status === "done") return;

    const actives = activePlayers();

    // Finish if only one remains
    if (actives.length <= 1) {
      state.status = "done";
      state.winnerId = actives[0]?.id || null;
      emit("tournament_end", { winnerId: state.winnerId });
      return;
    }

    state.status = "playing";
    state.round += 1;

    // --- Build fresh pairings & decide moves now
    state.pairings = [];
    const pool = shuffle([...actives]);
    let bye = null;
    if (pool.length % 2 === 1) {
      bye = pool.pop();
    }

    for (let i = 0; i < pool.length; i += 2) {
      const a = pool[i];
      const b = pool[i + 1];
      const aMove = decideMove();
      const bMove = decideMove();
      a.lastMove = aMove;
      b.lastMove = bMove;

      let result = "tie";
      if (aMove !== bMove) {
        result = beats[aMove] === bMove ? "a" : "b";
      }

      state.pairings.push({
        aId: a.id,
        bId: b.id,
        aMove,
        bMove,
        result,          // 'a' | 'b' | 'tie'
      });
    }

    // Emit matches (with moves) so UI can reveal immediately
    emit("matches", state.pairings.map(p => {
      const a = state.players.find(x => x.id === p.aId);
      const b = state.players.find(x => x.id === p.bId);
      return {
        a, b,
        aMove: p.aMove,
        bMove: p.bMove,
        result: p.result,
        round: state.round,
        status: "revealing",
      };
    }));

    // Start move clock
    state.moveMs = cfg.moveTimeMs;
    emit("round_start", { round: state.round, alive: actives.length, ms: state.moveMs });

    clearInterval(timer);
    timer = setInterval(() => {
      state.moveMs -= 1000;
      emit("move_tick", { ms: state.moveMs });
      if (state.moveMs <= 0) {
        clearInterval(timer);

        // Apply results at buzzer
        state.pairings.forEach(({ aId, bId, result }) => {
          if (result === "tie") return; // no life change on tie
          const a = state.players.find((p) => p.id === aId);
          const b = state.players.find((p) => p.id === bId);
          const loser = result === "a" ? b : a;
          loser.lives = Math.max(0, (loser.lives ?? 0) - 1);
          if (loser.lives <= 0) loser.out = true;
        });

        emit("round_end", {
          round: state.round,
          byeId: bye?.id || null,
          pairings: state.pairings,
          alive: activePlayers().length,
          eliminated: state.players.filter((p) => p.out).map((p) => p.id),
        });

        // Next countdown or finish
        const alive = activePlayers();
        if (alive.length <= 1) {
          state.status = "done";
          state.winnerId = alive[0]?.id || null;
          emit("tournament_end", { winnerId: state.winnerId });
          return;
        }

        state.status = "countdown";
        state.countdownMs = cfg.roundTimeMs;
        emit("countdown_begin", { round: state.round + 1, ms: state.countdownMs });

        clearInterval(timer);
        timer = setInterval(() => {
          state.countdownMs -= 1000;
          emit("tick", { ms: state.countdownMs });
          if (state.countdownMs <= 0) {
            clearInterval(timer);
            playOneRound();
          }
        }, 1000);
      }
    }, 1000);
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    start,
    stop,
    subscribe,
    getState: () => JSON.parse(JSON.stringify(state)),
    config: cfg,
  };
}

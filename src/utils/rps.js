// src/utils/rps.js

// Moves
export const MOVES = ["rock", "paper", "scissors"];

// Who beats who map
export const BEATS = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

// Pair players 2-by-2
export function pairStrict(list) {
  const out = [];
  const evenLen = list.length - (list.length % 2);
  for (let i = 0; i < evenLen; i += 2) out.push([list[i], list[i + 1]]);
  return out;
}

// RPS logic
export function rpsResolve(a, b) {
  if (a === b) return 0;
  return BEATS[a] === b ? 1 : 2;
}

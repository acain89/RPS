// src/utils/rps.js

export function rpsResolve(a, b) {
  if (a === b) return 0;
  if (
    (a === "rock" && b === "scissors") ||
    (a === "scissors" && b === "paper") ||
    (a === "paper" && b === "rock")
  ) {
    return 1; // A wins
  }
  return 2; // B wins
}

export const TIERS = [
  { id: "rookie", name: "Rookie", entry: 5, topPrize: 40, paysRounds: "R3–R5", max: 32 },
  { id: "pro",    name: "Pro",    entry: 10, topPrize: 90, paysRounds: "R3–R5", max: 32 },
  { id: "elite",  name: "Elite",  entry: 20, topPrize: 150, paysRounds: "R3–R5", max: 32 },
];

export const ROUND_LIVES = (round) => (round <= 3 ? 3 : 5);

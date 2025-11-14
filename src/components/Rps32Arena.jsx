import React, { useEffect, useState } from "react";
import MatchCard from "./MatchCard";

export default function Rps32Arena({ engine }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!engine) return;
    const unsub = engine.subscribe((e) => {
      setState({ ...e.state });
    });
    return unsub;
  }, [engine]);

  if (!state || !state.players) return null;

  const players = state.players;
  const rows = [];

  for (let i = 0; i < players.length; i += 2) {
    const p1 = players[i];
    const p2 = players[i + 1];
    if (p1 && p2) rows.push([p1, p2]);
  }

  return (
    <div className="arena-wrapper">
      {rows.map(([p1, p2], idx) => (
        <div key={idx} className="match-row">
          <MatchCard player={p1} />
          <div className="neon-vs">VS</div>
          <MatchCard player={p2} />
        </div>
      ))}
    </div>
  );
}

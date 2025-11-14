import React, { useState } from "react";
import TournamentCard from "./TournamentCard";

export default function TournamentCarousel({ tiers, counts, runningTierId, onJoin }) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + tiers.length) % tiers.length);
  const next = () => setIndex((i) => (i + 1) % tiers.length);

  return (
    <div
  className="carousel-wrap"
  style={{
    width: "600px",   // card width
    margin: "0 auto",
    position: "relative" // lets arrows anchor to this box
  }}
>
      <button className="carousel-arrow left"  style={{left: "6px"}} onClick={prev}>‹</button>

      <div className="carousel-window">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {tiers.map((t) => (
            <div className="carousel-slide" key={t.id}>
              <TournamentCard
                name={t.name}
                entry={t.entry}
                topPrize={t.topPrize}
                paysRounds={t.paysRounds}
                count={counts[t.id] ?? 0}
                max={t.max}
                disabled={runningTierId === t.id}
                onJoin={() => onJoin(t)}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="carousel-arrow right" style={{right: "6px"}} onClick={next}>›</button>
    </div>
  );
}

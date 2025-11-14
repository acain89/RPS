// src/App.jsx
import React, { useState, useMemo } from "react";
import { Routes, Route } from "react-router-dom";

import TournamentCarousel from "./components/TournamentCarousel";
import LogoRPS32 from "./components/LogoRPS32";
import MatchPassSelect from "./components/MatchPassSelect";
import MatchArena from "./components/MatchArena";
import AuthPanel from "./components/AuthPanel";
import Landing from "./components/Landing";
import { TIERS } from "./constants";
import MatchPassPage from "./components/MatchPassPage";
import AuthPage from "./components/AuthPage";
import PlayerHome from "./components/PlayerHome";
import CashoutPage from "./components/CashoutPage";
import ProfilePage from "./components/ProfilePage";
import MatchReady from "./components/MatchReady";
import HowToPlay from "./components/HowToPlay";
import Rps32Arena from "./components/Rps32Arena";

export default function App() {
  const [counts] = useState({ rookie: 12, pro: 18, elite: 27 });
  const [runningTierId] = useState(null);
  const [selectedTierId, setSelectedTierId] = useState("rookie");

  const selectedTier = useMemo(
    () => TIERS.find((t) => t.id === selectedTierId),
    [selectedTierId]
  );

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Tournament Select */}
      <Route
        path="/play"
        element={
          <>
            <TournamentCarousel
              tiers={TIERS}
              counts={counts}
              runningTierId={runningTierId}
              onJoin={(tierId) => setSelectedTierId(tierId)}
            />
            <LogoRPS32 />
          </>
        }
      />

      {/* Match Pass */}
      <Route path="/match-pass" element={<MatchPassSelect />} />
      <Route path="/checkout/:tierId" element={<MatchPassPage />} />

      {/* Arena / Game */}
      <Route path="/match-arena" element={<MatchArena />} />
      <Route path="/ready" element={<MatchReady />} />

      {/* Player Home + Profile */}
      <Route path="/home" element={<PlayerHome />} />
      <Route path="/player-home" element={<PlayerHome />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Auth */}
      <Route path="/auth" element={<AuthPanel />} />
      <Route path="/login" element={<AuthPage />} />

      {/* Cashout */}
      <Route path="/cashout" element={<CashoutPage />} />

      {/* How to Play */}
      <Route path="/how-to-play" element={<HowToPlay />} />

      {/* Dev Arena */}
      <Route path="/dev-arena" element={<Rps32Arena />} />

      {/* Fake match pass */}
      <Route path="/fake-create-match-pass" element={<MatchPassPage />} />
    </Routes>
  );
}

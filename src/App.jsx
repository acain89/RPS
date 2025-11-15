// src/App.jsx
import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import DevArena from "./components/DevArena.jsx";

export default function App() {
  const [counts] = useState({ rookie: 12, pro: 18, elite: 27 });
  const [runningTierId] = useState(null);
  const [selectedTierId, setSelectedTierId] = useState("rookie");

  const selectedTier = useMemo(
    () => TIERS.find((t) => t.id === selectedTierId),
    [selectedTierId]
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Play → Logo + DevArena */}
        <Route
          path="/play"
          element={
            <>
              <LogoRPS32 />
              <DevArena />
            </>
          }
        />

        {/* Match Pass */}
        <Route path="/match-pass" element={<MatchPassSelect />} />
        <Route path="/checkout/:tierId" element={<MatchPassPage />} />

        {/* Arena / Game */}
        <Route path="/match-arena" element={<MatchArena />} />
        <Route path="/ready" element={<MatchReady />} />

        {/* Player */}
        <Route path="/home" element={<PlayerHome />} />
        <Route path="/player-home" element={<PlayerHome />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPanel />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Cashout */}
        <Route path="/cashout" element={<CashoutPage />} />

        {/* Guide */}
        <Route path="/how-to-play" element={<HowToPlay />} />

        {/* Fake pass debug */}
        <Route path="/fake-create-match-pass" element={<MatchPassPage />} />

        {/* Direct Dev Arena */}
        <Route path="/dev-arena" element={<DevArena />} />
      </Routes>
    </BrowserRouter>
  );
}

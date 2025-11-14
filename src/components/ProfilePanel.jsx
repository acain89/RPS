import React from "react";

export default function ProfilePanel({
  open,
  onClose,
  user = { username: "Guest" },
  stats = { credits: 0, played: 0, wins: 0, winRate: "0%", earnings: 0, cashedOut: 0 },
  onBuyTickets,   // reuse as "Buy Credits"
  onCashOut,
  onLogout,
}) {
  const uname = user?.username || "Guest";
  const initials = uname
    .split(" ")
    .filter(Boolean)
    .map(s => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GU";

  return (
    <div className={`panel left ${open ? "open" : ""}`}>
      <div className="panel-head">
        <span>PROFILE</span>
        <button className="btn tiny" onClick={onClose}>Close</button>
      </div>

      <div className="profile-content">
        {/* Avatar */}
        <div className="avatar-circle">{initials}</div>

        <h3 style={{ textAlign: "center", marginTop: 8 }}>{uname}</h3>

        <div className="stat-row"><b>Credits:</b> ${Number(stats.credits || 0)}</div>
        <div className="stat-row"><b>Games Played:</b> {Number(stats.played || 0)}</div>
        <div className="stat-row"><b>Wins:</b> {Number(stats.wins || 0)}</div>
        <div className="stat-row"><b>Win Rate:</b> {stats.winRate || "0%"}</div>
        <div className="stat-row"><b>Total Earnings:</b> ${Number(stats.earnings || 0)}</div>
        <div className="stat-row"><b>Total Cashed Out:</b> ${Number(stats.cashedOut || 0)}</div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <button className="btn" onClick={onBuyTickets}>Buy Credits</button>
          <button className="btn" onClick={onCashOut}>Cash Out</button>
          <button className="btn danger" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default function MatchCard({ a="Player A", b="Player B", round=1 }) {
  const lives = round <= 3 ? 3 : 5;
  const dots = Array.from({ length: lives });

  return (
    <div className="match-row">
      {/* LEFT PLAYER */}
      <div className="match-card neon-card left-card">
        <div className="lives-row">
          {dots.map((_,i)=><span key={i} className="life-dot"/>)}
        </div>
        <div className="name">{a}</div>
        <div className="emoji-row big-emojis">
          <span>✊</span><span>✋</span><span>✌️</span>
        </div>
      </div>

      <div className="vs neon-vs">VS</div>

      {/* RIGHT PLAYER */}
      <div className="match-card neon-card right-card">
        <div className="lives-row">
          {dots.map((_,i)=><span key={i} className="life-dot"/>)}
        </div>
        <div className="name">{b}</div>
        <div className="emoji-row big-emojis mirrored">
          <span>✊</span><span>✋</span><span>✌️</span>
        </div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HowToPlay() {
  const navigate = useNavigate();
  const card = { initial:{y:20,opacity:0}, animate:{y:0,opacity:1} };

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(145deg,#091921,#0a2a33)",
      color:"#00FFE0", fontFamily:"'Rajdhani',sans-serif", padding:"64px 24px",
      display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center"
    }}>
      <h1 style={{fontSize:36, marginBottom:8}}>How to Play</h1>
      <p style={{opacity:.85, marginBottom:32}}>Fast. Fair. Skill-based. Six matches per pass.</p>

      <div style={{
        display:"grid", gap:18, width:"100%", maxWidth:960,
        gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))"
      }}>
        <motion.div {...card} transition={{duration:.35, delay:.05}}
          style={tileStyle}><h2 style={h2}>1. Choose a Match Pass</h2>
          <p>Pick Rookie, Pro, or Elite to get 6 matches with fixed per-win payouts.</p></motion.div>

        <motion.div {...card} transition={{duration:.35, delay:.15}}
          style={tileStyle}><h2 style={h2}>2. Win Rounds</h2>
          <p>Play head-to-head RPS. Each win instantly adds to your earnings.</p></motion.div>

        <motion.div {...card} transition={{duration:.35, delay:.25}}
          style={tileStyle}><h2 style={h2}>3. Cash Out or Replay</h2>
          <p>After 6 matches, cash out (5% fee) or buy another pass to keep going.</p></motion.div>
      </div>

      <div style={{marginTop:28, display:"flex", gap:12}}>
        <button style={cta} onClick={()=>navigate("/match-pass")}>Next</button>
        <button style={ghost} onClick={()=>navigate("/")}>Back</button>
      </div>
    </div>
  );
}

const tileStyle = {
  background:"rgba(0,255,224,0.06)", border:"1px solid rgba(0,255,224,0.18)",
  borderRadius:12, padding:"18px 16px", boxShadow:"0 0 22px rgba(0,255,213,0.10)"
};
const h2 = { fontSize:20, margin:"0 0 6px 0" };
const cta = {
  background:"#00FFE0", color:"#002824", border:"none", padding:"12px 22px",
  borderRadius:10, fontWeight:700, cursor:"pointer"
};
const ghost = {
  background:"transparent", color:"#00FFE0", border:"2px solid #00FFE0",
  padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer"
};

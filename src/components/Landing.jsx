import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #091921, #0a2a33)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#00FFE0",
        fontFamily: "'Rajdhani', sans-serif",
        position: "relative"
      }}
    >
      {/* Login top-right */}
      <button
        onClick={() => navigate("/auth")}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          background: "transparent",
          color: "#00FFE0",
          border: "2px solid #00FFE0",
          padding: "10px 22px",
          borderRadius: "8px",
          fontSize: "15px",
          cursor: "pointer"
        }}
      >
        Login
      </button>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        style={{
          fontSize: "42px",
          fontWeight: 700,
          marginBottom: "10px",
          textShadow: "0 0 12px rgba(0,255,213,0.4)"
        }}
      >
        Win Real Cash Playing RPS
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1.1 }}
        style={{
          fontSize: "20px",
          fontWeight: 500,
          opacity: 0.9,
          marginBottom: "40px"
        }}
      >
        Fast. Fair. Skill-Based.
      </motion.p>

      {/* Next Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        onClick={() => navigate("/how-to-play")}
        style={{
          background: "#00FFE0",
          color: "#002824",
          padding: "14px 34px",
          borderRadius: "10px",
          fontSize: "20px",
          fontWeight: 700,
          cursor: "pointer",
          border: "none",
          boxShadow: "0 0 16px rgba(0,255,213,0.4)"
        }}
      >
        Next →
      </motion.button>
    </div>
  );
}

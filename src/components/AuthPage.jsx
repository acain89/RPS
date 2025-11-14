import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect");
  
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      // After success redirect logic
      if (redirectTo === "match-pass") navigate("/match-pass");
      else navigate("/match-arena");
      
    } catch (err) {
      setError(err.message.replace("Firebase:", "").trim());
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#091921,#0a2a33)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Rajdhani', sans-serif",
        color: "#00FFE0",
        padding: 20
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "rgba(0,255,213,0.06)",
          border: "2px solid rgba(0,255,213,0.4)",
          borderRadius: "14px",
          padding: "32px 26px",
          boxShadow: "0 0 18px rgba(0,255,213,0.22)",
          textAlign: "center"
        }}
      >
        {/* Close button */}
        <div style={{ textAlign: "right" }}>
          <button
            onClick={() => navigate("/match-pass")}
            style={{
              background: "transparent",
              color: "#00FFE0",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              marginBottom: "-22px"
            }}
          >
            ✕
          </button>
        </div>

        <h2 style={{ fontSize: "28px", marginBottom: "18px" }}>
          {mode === "login" ? "Login" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid rgba(0,255,213,0.35)",
              background: "transparent",
              color: "#00FFE0",
              fontSize: "16px"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid rgba(0,255,213,0.35)",
              background: "transparent",
              color: "#00FFE0",
              fontSize: "16px"
            }}
          />

          {error && (
            <div style={{ color: "#ff4e4e", fontSize: "14px" }}>{error}</div>
          )}

          <motion.button
            whileTap={{ scale: 0.94 }}
            style={{
              background: "#00FFE0",
              color: "#002824",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer"
            }}
          >
            {mode === "login" ? "Login" : "Register"}
          </motion.button>
        </form>

        <div style={{ marginTop: "16px", fontSize: "16px" }}>
          {mode === "login" ? (
            <>New player?{" "}
              <span
                onClick={() => setMode("register")}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Create account
              </span>
            </>
          ) : (
            <>Already have an account?{" "}
              <span
                onClick={() => setMode("login")}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Login
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

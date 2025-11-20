import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import "../components/Login.css"; // neon theme

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect");

  const [mode, setMode] = useState("login");
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

      if (redirectTo === "match-pass") {
  navigate("/match-pass");
} else if (redirectTo === "dev-arena") {
  navigate("/dev-arena");
} else {
  navigate("/match-arena"); // fallback
}

      
    } catch (err) {
      setError(err.message.replace("Firebase:", "").trim());
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="auth-card"
      >
        {/* Close Button */}
        <button
          className="auth-close"
          onClick={() => navigate("/match-pass")}
        >
          ✕
        </button>

        <h2 className="auth-title">
          {mode === "login" ? "Login" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <motion.button
            whileTap={{ scale: 0.94 }}
            className="auth-btn"
          >
            {mode === "login" ? "Login" : "Register"}
          </motion.button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              New player?{" "}
              <span onClick={() => setMode("register")}>Create account</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setMode("login")}>Login</span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

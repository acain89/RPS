// src/components/AuthPanel.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthPanel() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [params] = useSearchParams();

  // This will redirect back to the page requested before login
  const redirect = params.get("redirect") || "/dev-arena";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // REGISTER
        await createUserWithEmailAndPassword(auth, email, password);
      }

      // SUCCESS → Go to redirect target
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="switch-mode">
          {isLogin ? (
            <>
              Need an account?{" "}
              <span onClick={() => setIsLogin(false)}>Register</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Login</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

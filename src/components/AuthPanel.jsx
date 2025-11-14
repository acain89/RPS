import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function AuthPanel() {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/player-home";

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, pw);
      } else {
        await signInWithEmailAndPassword(auth, email, pw);
      }
      navigate(redirect);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(145deg,#091921,#0a2a33)",
      color:"#00FFE0",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      fontFamily:"'Rajdhani',sans-serif"
    }}>
      <form onSubmit={submit} style={{
        width:"320px",
        background:"rgba(0,255,224,0.08)",
        border:"1px solid rgba(0,255,224,0.25)",
        padding:"28px",
        borderRadius:"14px"
      }}>
        <h2 style={{textAlign:"center", marginBottom:"20px"}}>
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {err && <p style={{color:"#ff7777", marginBottom:"8px"}}>{err}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          style={{
            width:"100%",padding:"10px",marginBottom:"12px",
            borderRadius:"8px",border:"none"
          }}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e=>setPw(e.target.value)}
          style={{
            width:"100%",padding:"10px",marginBottom:"18px",
            borderRadius:"8px",border:"none"
          }}
          required
        />

        <button style={{
          width:"100%",background:"#00FFE0",color:"#002824",
          padding:"12px",borderRadius:"10px",border:"none",
          fontWeight:700,cursor:"pointer",marginBottom:"12px"
        }}>
          {mode === "login" ? "Login" : "Create Account"}
        </button>

        <div style={{textAlign:"center",opacity:.85}}>
          {mode === "login" ? (
            <span onClick={()=>setMode("register")} style={{cursor:"pointer"}}>
              Need an account? Register
            </span>
          ) : (
            <span onClick={()=>setMode("login")} style={{cursor:"pointer"}}>
              Already have an account? Login
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

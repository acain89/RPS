import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWOZMj1FeMGEhvU4lzDBOhQ6Tti0B7upQ",
  authDomain: "rps64-63d8d.firebaseapp.com",
  projectId: "rps64-63d8d",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Expose auth globally for admin console tools (prod + dev)
if (typeof window !== "undefined") {
  window.auth = auth;
}

// ✅ Silent auto-guest login (only fails in strict prod)
signInAnonymously(auth).catch(() => {});

export default {};

// ✅ Admin helper to fill queue (local dev only)
if (typeof window !== "undefined") {
  window.fill64 = async () => {
    const token = await window.auth.currentUser.getIdToken();
    for (let i = 1; i <= 64; i++) {
      await fetch("http://localhost:10000/join-queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
    }
    console.log("✅ Filled queue with 64 fake players");
  };
}

// Global error handlers
window.onerror = (msg, url, line, col, error) => {
  console.error("🔥 GLOBAL ERROR:", msg, error);
};
window.onunhandledrejection = (event) => {
  console.error("🔥 UNHANDLED PROMISE:", event.reason);
};
console.log("ENV (FULL):", import.meta.env);


// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

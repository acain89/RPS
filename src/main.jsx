window.onerror = (msg, url, line, col, error) => {
  console.error("🔥 GLOBAL ERROR:", msg, error);
};
window.onunhandledrejection = (event) => {
  console.error("🔥 UNHANDLED PROMISE:", event.reason);
};



// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

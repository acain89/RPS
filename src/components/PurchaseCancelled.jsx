export default function PurchaseCancelled() {
  return (
    <div
      style={{
        padding: "48px 24px",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: "#FF6363",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Payment Cancelled</h1>
      <p style={{ opacity: 0.8, marginBottom: 32 }}>
        You can try again anytime.
      </p>

      <button
        onClick={() => (window.location.href = "/home")}
        style={{
          padding: "12px 24px",
          background: "#FF6363",
          color: "#000",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Return Home
      </button>
    </div>
  );
}

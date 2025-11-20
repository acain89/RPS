import "./Login.css";

return (
  <div className="login-page">
    <div className="login-box">

      <div className="login-title">Login</div>

      <input
        type="email"
        className="login-input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="login-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="login-btn" onClick={handleLogin}>
        Login
      </button>

      <div className="login-footer">
        Need an account?{" "}
        <Link to="/register">Register</Link>
      </div>

    </div>
  </div>
);

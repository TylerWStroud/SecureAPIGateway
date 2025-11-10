import React, { useState, useEffect } from "react";
import { apiClient } from "../apiClient";
import "./Components.css";

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");

  // When the login page loads, check if we stored a "session expired" message
  useEffect(() => {
    const msg = localStorage.getItem("sessionExpired");
    if (msg) {
      setSessionMessage(msg);
      // clear it so if the user refreshes it doesn't keep showing
      localStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });
      console.log("Login response:", response.data);
      const { token } = response.data;
      if (!token) throw new Error("Token missing in response");

      // store token in local storage
      localStorage.setItem("authToken", token);

      onLoginSuccess(); // Notify parent component of successful login
    } catch (error: any) {
      setError("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* show session-expired message if we were kicked out */}
      {sessionMessage && (
        <div style={{ color: "orange", marginBottom: "10px" }}>
          {sessionMessage}
        </div>
      )}

      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-input">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="admin or user"
          />
        </div>
        <div className="form-input">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="admin123 or user123"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div>
        <p>
          <strong>Demo Credentials:</strong>
        </p>
        <p>Admin: admin / admin123</p>
        <p>User: user / user123</p>
      </div>
    </div>
  );
};

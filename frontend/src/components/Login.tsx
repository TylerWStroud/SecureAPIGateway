import React, { useState } from "react";
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", { username, password });
      console.log("Login response:", response.data);
      const { token } = response.data;
      if (!token) throw new Error("Token missing in response");

      localStorage.setItem("authToken", token);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
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
        <p><strong>Demo Credentials:</strong></p>
        <p>Admin: admin / admin123</p>
        <p>User: user / user123</p>
      </div>
    </div>
  );
};

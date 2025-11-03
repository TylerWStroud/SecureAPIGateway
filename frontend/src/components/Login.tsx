import React, { useState } from "react";
import { api } from "../services/api";
import "./Components.css";

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // State variables for form inputs and status
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Indicate loading state
    setError(""); // Clear previous errors

    try {
      const response = await api.post("/auth/login", { username, password });
      const { access_token } = response.data;

      // store token in local storage
      localStorage.setItem("authToken", access_token);

      onLoginSuccess(); // Notify parent component of successful login
    } catch (error: any) {
      setError(
        "Login failed. Please try again."
      );
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    // Login form UI
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
            placeholder={"admin123 or user123"}
          />
        </div>

        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}

        {/* Login/Submit Button */}
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div>
        <p>
          <strong>Demo Credentials:</strong>
        </p>
        <p>Admin: admin / admin123 </p>
        <p>User: user / user123 </p>
      </div>
      <div></div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { UserList } from "./components/UserList";
import { ProductList } from "./components/ProductList";
import { OrderList } from "./components/OrderList";
import { HealthCheck } from "./components/HealthCheck";
import { Login } from "./components/Login";
import "./App.css";

export function App() {
  const [activeTab, setActiveTab] = useState<
    "users" | "products" | "orders" | "health"
  >("users");
  const [isLight, setIsLight] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  // Load saved theme preference or detect system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsLight(savedTheme === "light");
      return;
    }

    // Otherwise, detect and watch for system preference
    const matchMedia = window.matchMedia("(prefers-color-scheme: light)");
    setIsLight(matchMedia.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsLight(e.matches);
    };

    matchMedia.addEventListener("change", handleChange);

    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, []);

  // Apply theme to body element
  useEffect(() => {
    document.documentElement.className = isLight ? "light" : "";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  }, [isLight]);

  // Toggle theme handler b/w light & dark
  const toggleTheme = () => {
    setIsLight(!isLight);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  // show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Secure API Gateway</h1>
          <nav className="theme-toggle">
            <button onClick={toggleTheme}>
              {isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </button>
          </nav>
        </header>
        <main>
          <Login onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Secure API Gateway</h1>
        <nav className="theme-toggle">
          <button onClick={toggleTheme}>
            {isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          </button>
        </nav>
        <nav className="tab-navigation">
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={activeTab === "health" ? "active" : ""}
            onClick={() => setActiveTab("health")}
          >
            Health Check
          </button>
        </nav>
      </header>
      <main className="App-main">
        {activeTab === "users" && <UserList />}
        {activeTab === "products" && <ProductList />}
        {activeTab === "orders" && <OrderList />}
        {activeTab === "health" && <HealthCheck />}
      </main>
      <button style={{ width: "fit-content", alignSelf: "center", marginTop: 10}} onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;

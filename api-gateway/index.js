import http from "http";
import { URL } from "url";
import dotenv from "dotenv";
import { authenticate } from "./middleware/auth.js";
import pkg from "http-proxy";
const { createProxyServer } = pkg;
import rateLimit from "express-rate-limit";


dotenv.config();

const proxy = createProxyServer({});
const PORT = process.env.PORT || 3000;

const SERVICES = {
  users: "http://users-service:3001",
  products: "http://products-service:3002",
  orders: "http://orders-service:3003",
};

// Apply rate limiting middleware globally
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // max 100 requests per IP per window
  message: {
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5, // only 5 login attempts per IP
  message: {
    error: "Too many login attempts. Try again in 10 minutes.",
  },
});

function routeRequest(req, res) {
  // --- CORS Headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Api-Key"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // --- Routing ---
  if (path.startsWith("/auth")) {
    authLimiter(req, res, () => {
      proxy.web(req, res, { target: SERVICES.users });
    });
  } 
  else if (path.startsWith("/api/users")) {
    req.url = req.url.replace("/api", "");
    proxy.web(req, res, { target: SERVICES.users, changeOrigin: true });
  } 
  else if (path.startsWith("/api/products")) {
    authenticate(req, res, () => {
      req.url = req.url.replace("/api", "");
      proxy.web(req, res, { target: SERVICES.products, changeOrigin: true });
    });
  } 
  else if (path.startsWith("/api/orders")) {
    authenticate(req, res, () => {
      req.url = req.url.replace("/api", "");
      proxy.web(req, res, { target: SERVICES.orders, changeOrigin: true });
    });
  } 
  else if (path === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy" }));
  } 
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
}


const server = http.createServer((req, res) => {
  limiter(req, res, () => {
    routeRequest(req, res);
  });
});

server.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

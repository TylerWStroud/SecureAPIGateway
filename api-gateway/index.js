import http from "http";
import { URL } from "url";
import dotenv from "dotenv";
import { authenticate } from "./middleware/auth.js";
import pkg from "http-proxy";
const { createProxyServer } = pkg;

dotenv.config();

const proxy = createProxyServer({});
const PORT = process.env.API_GATEWAY_PORT || 3000;

const SERVICES = {
  users: "http://users-service:3001",
  products: "http://products-service:3002",
  orders: "http://orders-service:3003",
};

// in-memory rate limiter 
const rateLimitWindowMs =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min
const rateLimitMaxRequests =
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const requestLog = new Map(); // key: IP, value: { count, startTime }

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestLog.get(ip);

  // New client
  if (!entry) {
    requestLog.set(ip, { count: 1, startTime: now });
    return false;
  }

  // Reset if time window expired
  if (now - entry.startTime > rateLimitWindowMs) {
    requestLog.set(ip, { count: 1, startTime: now });
    return false;
  }

  entry.count++;
  requestLog.set(ip, entry);
  return entry.count > rateLimitMaxRequests;
}

function routeRequest(req, res) {
  const clientIp =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;

  // CORS headers 
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Api-Key"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // Handle preflight requests immediately (don’t count toward limiter)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rate limiting (skip OPTIONS and health routes) 
  if (!req.url.includes("/health") && isRateLimited(clientIp)) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Too many requests. Try again later." }));
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Routing 
  if (path.startsWith("/auth")) {
    proxy.web(req, res, { target: SERVICES.users, changeOrigin: true });
  } else if (path.startsWith("/api/users")) {
    req.url = req.url.replace("/api", "");
    proxy.web(req, res, {
      target: SERVICES.users,
      changeOrigin: true,
      headers: { Authorization: req.headers.authorization || "" },
    });
  } else if (path.startsWith("/api/products")) {
    authenticate(req, res, () => {
      req.url = req.url.replace("/api", "");
      proxy.web(req, res, {
        target: SERVICES.products,
        changeOrigin: true,
        headers: { Authorization: req.headers.authorization || "" },
      });
    });
  } else if (path.startsWith("/api/orders")) {
    authenticate(req, res, () => {
      req.url = req.url.replace("/api", "");
      proxy.web(req, res, {
        target: SERVICES.orders,
        changeOrigin: true,
        headers: { Authorization: req.headers.authorization || "" },
      });
    });
    } else if (path === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: `${Math.round(process.uptime())}s`,
      })
    );
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
}

const server = http.createServer((req, res) => {
  routeRequest(req, res);
});

server.listen(PORT, () =>
  console.log(`API Gateway running on port ${PORT}`)
);

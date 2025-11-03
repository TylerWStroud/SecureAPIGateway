import http from "http";
import { URL } from "url";
import dotenv from "dotenv";
import { handleLogin, authenticate } from "./middleware/auth.js";

// Load environment variables from .env file
dotenv.config();

// Mock backend services
// const backendServices = {
//   users: "http://localhost:3001",
//   products: "http://localhost:3002",
//   orders: "http://localhost:3003",
// };

// Security headers middleware
function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // res.setHeader("Referrer-Policy", "no-referrer");
  // res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
}

// Request logging function
function logRequest(req, res, startTime) {
  const duration = Date.now() - startTime; // request duration in ms
  const user = req.user ? `${req.user.username}` : "no user name"; // assuming req.user is set after authentication
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - ${
      res.statusCode
    } - ${duration}ms`
  );
}

// apply authentication middleware. Continue if authorized
function applyAuthentication(req, res, callback) {
  authenticate(req, res, () => {
    // authentication successful
    callback();
  });
}

// Route handler function
function handleRequest(req, res) {
  const startTime = Date.now(); // start time for logging
  const url = new URL(req.url, `http://${req.headers.host}`); // parse URL
  const path = url.pathname; // get path

  // set security headers
  setSecurityHeaders(res);

  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    logRequest(req, res, startTime);
    return;
  }

  // ****** SERVICE ROUTING ******
  if (path === "/auth/login") {
    // login endpont - no authentication required
    handleLogin(req, res);
    logRequest(req, res, startTime);
  } else if (path.startsWith("/api/users")) {
    // Protected route - requires authentication
    applyAuthentication(req, res, () => {
      handleUsersRoute(req, res, startTime);
    });
  } else if (path.startsWith("/api/products")) {
    // Protected route - requires authentication
    applyAuthentication(req, res, () => {
      handleProductsRoute(req, res, startTime);
    });
  } else if (path.startsWith("/api/orders")) {
    // Protected route - requires authentication
    applyAuthentication(req, res, () => {
      handleOrdersRoute(req, res, startTime);
    });
  } else if (path === "/health") {
    handleHealthCheck(req, res, startTime);
  } else if (path === "/") {
    handleRoot(req, res, startTime);
  } else {
    handleNotFound(req, res, startTime);
  }
}

// Route handlers
function handleUsersRoute(req, res, startTime) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    res.end(
      JSON.stringify({
        message: "Users service response",
        method: "GET",
        path: req.url,
        data: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
        ],
      })
    );
  } else if (req.method === "POST") {
    res.end(
      JSON.stringify({
        message: "User created successfully",
        method: "POST",
        path: req.url,
      })
    );
  } else {
    res.statusCode = 405;
    res.end(
      JSON.stringify({
        error: "Method not allowed",
        code: "METHOD_NOT_ALLOWED",
      })
    );
  }

  logRequest(req, res, startTime);
}

function handleProductsRoute(req, res, startTime) {
  // Products route
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    res.end(
      JSON.stringify({
        message: "Products service response",
        method: "GET",
        path: req.url,
        data: [
          { id: 1, name: "Laptop", price: 999.99 },
          { id: 2, name: "Mouse", price: 29.99 },
        ],
      })
    );
  } else {
    res.statusCode = 405;
    res.end(
      JSON.stringify({
        error: "Method not allowed",
        code: "METHOD_NOT_ALLOWED",
      })
    );
  }

  logRequest(req, res, startTime);
}

function handleOrdersRoute(req, res, startTime) {
  // Orders service route
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    res.end(
      JSON.stringify({
        message: "Orders service response",
        method: "GET",
        path: req.url,
        data: [
          { id: 1, userId: 1, productId: 1, status: "completed" },
          { id: 2, userId: 2, productId: 2, status: "pending" },
        ],
      })
    );
  } else if (req.method === "POST") {
    res.end(
      JSON.stringify({
        message: "Order created successfully",
        method: "POST",
        path: req.url,
      })
    );
  } else {
    res.statusCode = 405;
    res.end(
      JSON.stringify({
        error: "Method not allowed",
        code: "METHOD_NOT_ALLOWED",
      })
    );
  }

  logRequest(req, res, startTime);
}

function handleHealthCheck(req, res, startTime) {
  // Health check endpoint
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );

  logRequest(req, res, startTime);
}

function handleRoot(req, res, startTime) {
  // API documentation
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      message: "Secure API Gateway",
      version: "1.0.0",
      endpoints: [
        "POST /auth/login - Authenticate and get Bearer token",
        "GET /api/users - Get all users (requires auth)",
        "POST /api/users - Create user (requires auth)",
        "GET /api/products - Get all products (requires auth)",
        "GET /api/orders - Get all orders (requires auth)",
        "POST /api/orders - Create order (requires auth)",
        "GET /health - Health check",
      ],
    })
  );

  logRequest(req, res, startTime);
}

function handleNotFound(req, res, startTime) {
  // 404 handler
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: "Not Found",
      message: `Route ${req.method} ${req.url} not found`,
      availableEndpoints: [
        "/auth/login",
        "/api/users",
        "/api/products",
        "/api/orders",
        "/health",
      ],
    })
  );

  logRequest(req, res, startTime);
}

// Create and start server
const server = http.createServer(handleRequest);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Secure API Gateway running at http://localhost:${PORT}/`);
  console.log(`Available endpoints:`);
  console.log(
    `   GET  /api/users    - Get all users (authentication required)`
  );
  console.log(`   POST /api/users    - Create user (authentication required)`);
  console.log(
    `   GET  /api/products - Get all products (authentication required)`
  );
  console.log(
    `   GET  /api/orders   - Get all orders (authentication required)`
  );
  console.log(`   POST /api/orders   - Create order (authentication required)`);
  console.log(`   GET  /health       - Health check`);
  console.log(`   GET  /             - API documentation`);
});

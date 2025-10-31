import http from "http";
import { URL } from "url";

// Mock backend services
const backendServices = {
  users: "http://localhost:3001",
  products: "http://localhost:3002",
  orders: "http://localhost:3003",
};

// Request logging function
function logRequest(req, res, startTime) {
  const duration = Date.now() - startTime;
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - ${
      res.statusCode
    } - ${duration}ms`
  );
}

// Route handler function
function handleRequest(req, res) {
  const startTime = Date.now();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    logRequest(req, res, startTime);
    return;
  }

  // Route to different services based on path
  if (path.startsWith("/api/users")) {
    handleUsersRoute(req, res, startTime);
  } else if (path.startsWith("/api/products")) {
    handleProductsRoute(req, res, startTime);
  } else if (path.startsWith("/api/orders")) {
    handleOrdersRoute(req, res, startTime);
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
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  logRequest(req, res, startTime);
}

function handleProductsRoute(req, res, startTime) {
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
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  logRequest(req, res, startTime);
}

function handleOrdersRoute(req, res, startTime) {
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
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  logRequest(req, res, startTime);
}

function handleHealthCheck(req, res, startTime) {
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
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      message: "Secure API Gateway",
      version: "1.0.0",
      endpoints: [
        "GET /api/users - Get all users",
        "POST /api/users - Create user",
        "GET /api/products - Get all products",
        "GET /api/orders - Get all orders",
        "POST /api/orders - Create order",
        "GET /health - Health check",
      ],
    })
  );

  logRequest(req, res, startTime);
}

function handleNotFound(req, res, startTime) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      error: "Not Found",
      message: `Route ${req.method} ${req.url} not found`,
      availableEndpoints: [
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
  console.log(`   GET  /api/users    - Get all users`);
  console.log(`   POST /api/users    - Create user`);
  console.log(`   GET  /api/products - Get all products`);
  console.log(`   GET  /api/orders   - Get all orders`);
  console.log(`   POST /api/orders   - Create order`);
  console.log(`   GET  /health       - Health check`);
  console.log(`   GET  /             - API documentation`);
});

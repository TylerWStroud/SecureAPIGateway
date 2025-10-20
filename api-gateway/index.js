import http from "http";
import {URL} from "url";

// mock backend services (the local hosts will turn into .com/api/users or /products or /orders etc when we go live)
const backendServices = {
    users: "http://localhost:3001",
    products: "http://localhost:3002",
    orders: "http://localhost:3003",
}

// server initialization & write-to
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World\n");
});

// local host port
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
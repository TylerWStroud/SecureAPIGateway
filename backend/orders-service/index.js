import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { authenticate } from "./middleware/authMiddleware.js";
import Order from "./models/Order.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_ORDERS_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB - Orders Service"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Get all orders
app.get("/orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({
      message: "Orders fetched successfully",
      user: req.user,
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Create order with product info
app.post("/orders", authenticate, async (req, res) => {
  try {
    const { productId, status } = req.body;
    const userId = req.user.id;

    // Fetch product info from products-service and forward JWT
    const productRes = await axios.get(
      `http://products-service:3002/products/${productId}`,
      {
        headers: {
          Authorization: req.headers.authorization, // forward token
        },
      }
    );

    const productName =
      productRes.data?.name || productRes.data?.data?.name || "Unknown Product";

    const order = new Order({
      userId,
      productId,
      productName,
      status: status || "pending",
    });

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        productName: order.productName,
        status: order.status,
      },
    });
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// Update order
app.put("/orders/:id", authenticate, async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Order updated successfully", data: updated });
  } catch (err) {
    console.error("Error updating order:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// Delete order
app.delete("/orders/:id", authenticate, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err.message);
    res.status(400).json({ error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ status: "healthy" }));


// Start service
const PORT = process.env.ORDERS_SERVICE_PORT || 3003;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Orders service running on port ${PORT}`)
);

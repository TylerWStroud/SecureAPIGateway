import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { authenticate } from "./middleware/authMiddleware.js";
import Order from "./models/Order.js"; //  import from models folder

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongodb:27017/ordersDB";
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB - Orders Service"))
  .catch((err) => console.error("MongoDB connection error:", err));

//  Get all orders
app.get("/orders", authenticate, async (req, res) => {
  const orders = await Order.find();
  res.json({
    message: "Orders fetched successfully",
    user: req.user,
    data: orders,
  });
});


//  Create order with product name and readable ID
app.post("/orders", authenticate, async (req, res) => {
  try {
    const { productId, status } = req.body;
    const userId = req.user.id;

    // Fetch product info safely from products-service
    const productRes = await axios.get(
      `http://products-service:3002/products/${productId}`
    );

    // Fallback if response doesn’t include data.name
    const productName =
      productRes.data?.name || productRes.data?.data?.name || "Unknown Product";

    // Create new order with readable fields
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


//  Update
app.put("/orders/:id", authenticate, async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ message: "Order updated successfully", data: updated });
});

//  Delete
app.delete("/orders/:id", authenticate, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted successfully" });
});

// Start service
const PORT = process.env.PORT || 3003;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Orders service running on port ${PORT}`)
);

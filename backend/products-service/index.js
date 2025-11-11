import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { authenticate } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_PRODUCTS_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB - Products Service"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  description: { type: String },
});

const Product = mongoose.model("Product", productSchema);

// Routes
app.get("/products", authenticate, async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ message: "Products fetched successfully", data: products });
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/products", authenticate, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res
      .status(201)
      .json({ message: "Product created successfully", data: product });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(400).json({ error: error.message });
  }
});

app.delete("/products/:id", authenticate, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// Fetch single product by ID (used by orders-service)
app.get("/products/:id", authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ name: product.name, price: product.price });
  } catch (err) {
    console.error("Error fetching product:", err.message);
    res.status(400).json({ error: "Invalid product ID" });
  }
});

app.get("/health", (req, res) => res.json({ status: "healthy" }));

// Start service
const PORT = process.env.PRODUCTS_SERVICE_PORT || 3002;


app.listen(PORT, "0.0.0.0", () =>
  console.log(`Products service running on port ${PORT}`)
);

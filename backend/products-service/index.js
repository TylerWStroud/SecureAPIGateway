import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { authenticate } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongodb:27017/productsDB";
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB - Products Service"))
  .catch((err) => console.error("MongoDB connection error:", err));

// schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  description: { type: String },
});

const Product = mongoose.model("Product", productSchema);

// routes
app.get("/products", authenticate, async (req, res) => {
  const products = await Product.find();
  res.json({ message: "Products fetched successfully", data: products });
});

app.post("/products", authenticate, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product created successfully", data: product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/products/:id", authenticate, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted successfully" });
});

// Fetch single product by ID (used by orders-service)
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // respond with name and price (what orders-service needs)
    res.json({ name: product.name, price: product.price });
  } catch (err) {
    console.error("Error fetching product:", err.message);
    res.status(400).json({ error: "Invalid product ID" });
  }
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Products service running on port ${PORT}`)
);

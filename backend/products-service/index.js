import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/ecommerce";
mongoose.connect(MONGO_URL).then(() => console.log("Connected to MongoDB - Products Service"));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);

// GET all
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json({ data: products });
});

// GET one
app.get("/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ data: product });
});

// CREATE
app.post("/products", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json({ message: "Product created", data: product });
});

// UPDATE
app.put("/products/:id", async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Product updated", data: updated });
});

// DELETE
app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => console.log(`Products service running on port ${PORT}`));

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/ecommerce";
mongoose.connect(MONGO_URL).then(() => console.log(" Connected to MongoDB - Orders Service"));

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, default: "pending" },
});

const Order = mongoose.model("Order", orderSchema);

// GET all orders
app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json({ data: orders });
});

// CREATE order
app.post("/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json({ message: "Order created", data: order });
});

// UPDATE status
app.put("/orders/:id", async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Order updated", data: updated });
});

// DELETE
app.delete("/orders/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT,"0.0.0.0", () => console.log(`Orders service running on port ${PORT}`));

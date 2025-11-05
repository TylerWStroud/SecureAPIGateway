import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/ecommerce";
mongoose.connect(MONGO_URL).then(() => console.log("Connected to MongoDB - Users Service"));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

//CRUD ROUTES 

// GET all users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json({ data: users });
});

// GET single user
app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ data: user });
});

// CREATE user
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User created", data: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE user
app.put("/users/:id", async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "User updated", data: updated });
});

// DELETE user
app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`Users service running on port ${PORT}`));

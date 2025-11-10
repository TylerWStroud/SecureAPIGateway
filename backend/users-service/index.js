import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

app.get("/users", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const users = await User.find({}, "username roles");
    res.json({ data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongodb:27017/usersDB";
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected (Users Service)");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check
app.get("/health", (req, res) => res.json({ status: "healthy" }));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Users Service running on port ${PORT}`)
);

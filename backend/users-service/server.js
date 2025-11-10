import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes (login/signup)
app.use("/auth", authRoutes);

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/usersDB";
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB:", mongoose.connection.host);
    console.log("Using database:", mongoose.connection.name);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Admin dashboard routes
app.get("/users", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const users = await User.find({}, "username email roles");
    res.json({ data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const User = mongoose.model("User");
    const newUser = new User({
      username: username || `user_${Date.now()}`,
      email: email || `user${Date.now()}@example.com`,
      password: password || "default123",
    });

    await newUser.save();
    res.status(201).json({ message: "User created", data: newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ status: "healthy" }));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Users Service running on port ${PORT}`)
);

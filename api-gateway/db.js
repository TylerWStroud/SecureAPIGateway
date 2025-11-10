import mongoose from "mongoose";

export const connectGatewayDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://mongodb:27017/secure_api_gateway",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("Connected to MongoDB from API Gateway");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

import mongoose from "mongoose";
import {envVariable} from "../config/envVariable.js"; // Import environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(envVariable.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;

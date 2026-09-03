import mongoose from "mongoose";
import dns from "node:dns";

// MongoDB Atlas uses SRV records. Explicit resolvers avoid local DNS servers
// that reject Node's SRV lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

try {
  process.loadEnvFile(".env");
} catch (error) {
  console.error("Could not load .env:", error.message);
  process.exit(1);
}

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connection successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();

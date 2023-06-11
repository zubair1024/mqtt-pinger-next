import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (mongoose?.connection?.readyState === 1) {
      return console.log("Already connected to MongoDB");
    }
    console.log(process.env.NX_DB_URL);
    console.log("variables.DB_URL", process.env.NX_DB_URL);
    await mongoose.connect(process.env.NX_DB_URL as string, {
      directConnection: true,
    });
    console.log("Connected to DB ✅");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}

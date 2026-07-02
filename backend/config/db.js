// backend/config/db.js
// ──────────────────────────────────────────────────────────
// Establishes and exports the MongoDB connection via Mongoose.
// Called once from server.js on boot.
// ──────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Log connection-level errors that occur after the initial connect
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process on initial connection failure
  }
};

module.exports = connectDB;

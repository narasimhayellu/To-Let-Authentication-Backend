const mongoose = require("mongoose");

const mongoDBConnection = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("MongoDB connection failed ❌", error.message);
  }
};

module.exports = mongoDBConnection;
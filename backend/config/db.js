const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: Host=${conn.connection.host}, Database=${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error('Make sure MongoDB Atlas connection string or local MongoDB service is running.');
    process.exit(1);
  }
};

module.exports = connectDB;

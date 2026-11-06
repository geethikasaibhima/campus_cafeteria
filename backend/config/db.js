const mongoose = require('mongoose');
const dns = require('dns');

// Fix for querySrv ECONNREFUSED on Windows / local Wi-Fi / ISP routers:
// Route SRV DNS resolution through Google's public DNS servers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('[DNS Notice]: Unable to override DNS servers:', dnsErr.message);
}

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

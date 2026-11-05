const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { autoSeedIfEmpty } = require('./seed/seedMenu');

// Connect to MongoDB and auto-seed if fresh cloud database
connectDB().then(() => {
  autoSeedIfEmpty();
});

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with permissive CORS for local dev and network display devices
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.IO to Express app for use in controllers
app.set('io', io);

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Campus Cafeteria Sync API',
    uptime: process.uptime(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO Client Connected]: ID=${socket.id}`);

  socket.on('join:station', (stationName) => {
    socket.join(stationName);
    console.log(`[Socket.IO] Client ${socket.id} joined station: ${stationName}`);
  });

  socket.on('chime:ring', (payload) => {
    // Broadcast chime to all connected clients (especially TV and delivery stations)
    socket.broadcast.emit('chime:play', payload);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO Client Disconnected]: ID=${socket.id}`);
  });
});

// Root route fallback to serve frontend HTML if requested
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Campus Cafeteria Backend Server Running on Port ${PORT}`);
  console.log(` API URL:      http://localhost:${PORT}/api`);
  console.log(` Web Frontend: http://localhost:${PORT}/`);
  console.log(` Mode:         ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});

module.exports = { app, server };

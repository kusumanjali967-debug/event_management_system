const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const startServer = async () => {
  // Connect to Database (awaits connection attempt before loading models/routes)
  await connectDB();

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/events', require('./routes/eventRoutes'));
  app.use('/api/bookings', require('./routes/bookingRoutes'));
  app.use('/api/analytics', require('./routes/analyticsRoutes'));

  // Basic Root Route
  app.get('/', (req, res) => {
    res.send('Event Management System API is running...');
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

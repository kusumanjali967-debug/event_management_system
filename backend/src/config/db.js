const mongoose = require('mongoose');
const mongooseMock = require('./mongooseMock');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // Set connection timeout to 2.5 seconds
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-management', {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB Connection Failed: ${error.message}`);
    console.log(`FALLBACK: Switching to in-memory Mock Database for simulation.`);
    
    // Override mongoose in require cache so all model declarations get the mock
    require.cache[require.resolve('mongoose')].exports = mongooseMock;
  }
};

module.exports = connectDB;

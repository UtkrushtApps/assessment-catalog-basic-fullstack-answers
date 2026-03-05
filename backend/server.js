require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const assessmentRoutes = require('./routes/assessments');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

// API routes
app.use('/api/assessments', assessmentRoutes);

// Not found handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err); // Log for server-side debugging

  if (res.headersSent) {
    return;
  }

  const statusCode = err.statusCode || 500;
  const message =
    err.message || 'An unexpected error occurred. Please try again later.';

  res.status(statusCode).json({ success: false, error: message });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/assessment_catalog';

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

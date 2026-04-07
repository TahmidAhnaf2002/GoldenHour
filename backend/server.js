// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const donorRoutes = require('./routes/donorRoutes');

// // Load env variables
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/donors', donorRoutes);

// // Test route
// app.get('/api', (req, res) => {
//   res.json({ message: 'API is running...' });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
///////////////////////////Feature 2///////////////////////////////////////
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/emergency', emergencyRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
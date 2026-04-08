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
const campRoutes = require('./routes/campRoutes');
const bloodBankRoutes = require('./routes/bloodBankRoutes'); 
const antivenomRoutes = require('./routes/antivenomRoutes');
const medicineRoutes = require('./routes/medicineRoutes'); // with other requires

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
app.use('/api/camps', campRoutes); 
app.use('/api/bloodbanks', bloodBankRoutes); // with other routes
app.use('/api/antivenom', antivenomRoutes);
app.use('/api/medicines', medicineRoutes); // with other routes

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
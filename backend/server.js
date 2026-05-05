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
const nearExpiryRoutes = require('./routes/nearExpiryRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const responderRoutes = require('./routes/responderRoutes');
const sosRoutes = require('./routes/sosRoutes');
const lendingRoutes = require('./routes/lendingRoutes');
const alertRoutes = require('./routes/alertRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const dataQualityRoutes = require('./routes/dataQualityRoutes');
const { startScheduledJobs } = require('./services/dataQualityService');
const organDonorRoutes = require('./routes/organDonorRoutes');
const preparednessRoutes = require('./routes/preparednessRoutes');
const emergencyIdRoutes = require('./routes/emergencyIdRoutes');




// Load env variables
dotenv.config();

// Connect to database
connectDB();
startScheduledJobs();

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
app.use('/api/nearexpiry', nearExpiryRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/responders', responderRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/lending', lendingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quality', dataQualityRoutes);
app.use('/api/organ-donors', organDonorRoutes);
app.use('/api/preparedness', preparednessRoutes);
app.use('/api/emergency-id', emergencyIdRoutes);



// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const router = express.Router();
const {
  registerStock,
  updateStock,
  getMyStock,
  searchByAntivenom,
  getAllStocks,
} = require('../controllers/antivenomController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getAllStocks);
router.get('/search', searchByAntivenom);

// Private
router.post('/register', protect, registerStock);
router.put('/update', protect, updateStock);
router.get('/me', protect, getMyStock);

module.exports = router;
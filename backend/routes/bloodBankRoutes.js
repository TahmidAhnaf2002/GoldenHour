const express = require('express');
const router = express.Router();
const {
  registerBloodBank,
  getMyBloodBank,
  getAllBloodBanks,
  getBloodBankById,
  updateStock,
  requestTransfer,
  respondToTransfer,
} = require('../controllers/bloodBankController');
const { protect } = require('../middleware/authMiddleware');


// Public
router.get('/', getAllBloodBanks);
router.get('/:id', getBloodBankById);


// Private
router.post('/register', protect, registerBloodBank);
router.get('/user/me', protect, getMyBloodBank);
router.put('/stock/update', protect, updateStock);
router.post('/:id/transfer-request', protect, requestTransfer);
router.put('/transfer/:requestId/respond', protect, respondToTransfer);


module.exports = router;

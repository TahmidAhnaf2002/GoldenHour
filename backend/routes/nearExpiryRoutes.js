const express = require('express');
const router = express.Router();
const {
  postMedicine,
  getListings,
  getMyListings,
  claimMedicine,
  updateClaimStatus,
  removeListing,
  getStats,
  getMyClaims,
} = require('../controllers/nearExpiryController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getListings);
router.get('/stats', getStats);

// Private
router.post('/post', protect, postMedicine);
router.get('/mine', protect, getMyListings);
router.get('/claims/mine', protect, getMyClaims);
router.post('/:id/claim', protect, claimMedicine);
router.put('/:id/claims/:claimId/status', protect, updateClaimStatus);
router.put('/:id/remove', protect, removeListing);

module.exports = router;
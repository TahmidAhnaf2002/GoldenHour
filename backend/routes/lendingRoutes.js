const express = require('express');
const router  = express.Router();
const {
  listEquipment,
  getListings,
  getMyListings,
  sendRequest,
  updateRequestStatus,
  confirmReturn,
  getMyRequests,
} = require('../controllers/lendingController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', getListings);

// Private
router.post('/list',                                          protect, listEquipment);
router.get('/mine',                                           protect, getMyListings);
router.get('/requests/mine',                                  protect, getMyRequests);
router.post('/:id/request',                                   protect, sendRequest);
router.put('/:id/requests/:requestId/status',                 protect, updateRequestStatus);
router.put('/:id/requests/:requestId/confirm-return',         protect, confirmReturn);

module.exports = router;
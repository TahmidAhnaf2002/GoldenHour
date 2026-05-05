const Lending = require('../models/lendingModel');

// @desc    List equipment for lending
// @route   POST /api/lending/list
// @access  Private
const listEquipment = async (req, res) => {
  try {
    const {
      equipmentType, equipmentName, description, condition,
      depositAmount, maxDurationDays, location, lenderPhone,
    } = req.body;

    const listing = await Lending.create({
      lender:       req.user._id,
      lenderName:   req.user.name,
      lenderPhone,
      equipmentType, equipmentName, description,
      condition:       condition || 'Good',
      depositAmount:   Number(depositAmount) || 0,
      maxDurationDays: Number(maxDurationDays) || 30,
      location,
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Browse available lending listings
// @route   GET /api/lending
// @access  Public
const getListings = async (req, res) => {
  try {
    const { equipmentType, division, district } = req.query;
    const query = { isAvailable: true };

    if (equipmentType) query.equipmentType = equipmentType;
    if (division)      query['location.division'] = division;
    if (district)      query['location.district'] = district;

    const listings = await Lending.find(query).sort({ createdAt: -1 });
    res.json({ count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my lending listings
// @route   GET /api/lending/mine
// @access  Private
const getMyListings = async (req, res) => {
  try {
    const listings = await Lending.find({ lender: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send borrow request
// @route   POST /api/lending/:id/request
// @access  Private
const sendRequest = async (req, res) => {
  try {
    const listing = await Lending.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!listing.isAvailable) return res.status(400).json({ message: 'Equipment not available' });

    if (listing.lender.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot borrow your own equipment' });
    }

    const existing = listing.requests.find(
      (r) => r.borrower.toString() === req.user._id.toString()
        && ['Pending', 'Approved', 'Active'].includes(r.status)
    );
    if (existing) return res.status(400).json({ message: 'You already have an active request' });

    const { borrowerPhone, purpose, durationDays } = req.body;

    listing.requests.push({
      borrower:      req.user._id,
      borrowerName:  req.user.name,
      borrowerPhone,
      purpose:       purpose || '',
      durationDays:  Number(durationDays) || 1,
    });

    await listing.save();
    res.json({ message: 'Borrow request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lender approves / rejects a request
// @route   PUT /api/lending/:id/requests/:requestId/status
// @access  Private
const updateRequestStatus = async (req, res) => {
  try {
    const listing = await Lending.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.lender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const request = listing.requests.id(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const { status } = req.body;
    request.status = status;

    if (status === 'Approved') {
      request.approvedAt = new Date();
      listing.isAvailable = false;
    }
    if (status === 'Rejected' || status === 'Cancelled') {
      listing.isAvailable = true;
    }

    await listing.save();
    res.json({ message: `Request ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm return (both parties)
// @route   PUT /api/lending/:id/requests/:requestId/confirm-return
// @access  Private
const confirmReturn = async (req, res) => {
  try {
    const listing = await Lending.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const request = listing.requests.id(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const { rating } = req.body;
    const userId = req.user._id.toString();

    if (listing.lender.toString() === userId) {
      request.lenderConfirmed = true;
      if (rating) request.borrowerRating = Number(rating);
    } else if (request.borrower.toString() === userId) {
      request.borrowerConfirmed = true;
      if (rating) request.lenderRating = Number(rating);
    } else {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Both confirmed — complete the return
    if (request.lenderConfirmed && request.borrowerConfirmed) {
      request.status     = 'Returned';
      request.returnedAt = new Date();
      listing.isAvailable = true;
      listing.totalLends += 1;

      // Compute average rating from all returned requests
      const ratings = listing.requests
        .filter((r) => r.lenderRating != null)
        .map((r) => r.lenderRating);
      if (ratings.length > 0) {
        listing.averageRating = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
      }
    }

    await listing.save();
    res.json({ message: 'Return confirmation recorded', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my borrow requests
// @route   GET /api/lending/requests/mine
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const listings = await Lending.find({ 'requests.borrower': req.user._id });

    const requests = [];
    listings.forEach((listing) => {
      listing.requests
        .filter((r) => r.borrower.toString() === req.user._id.toString())
        .forEach((r) => {
          requests.push({
            requestId:   r._id,
            status:      r.status,
            durationDays:r.durationDays,
            purpose:     r.purpose,
            requestedAt: r.requestedAt,
            approvedAt:  r.approvedAt,
            returnedAt:  r.returnedAt,
            lenderConfirmed:   r.lenderConfirmed,
            borrowerConfirmed: r.borrowerConfirmed,
            depositPaid:       r.depositPaid,
            lenderRating:      r.lenderRating,
            listing: {
              id:            listing._id,
              equipmentType: listing.equipmentType,
              equipmentName: listing.equipmentName,
              lenderName:    listing.lenderName,
              lenderPhone:   listing.lenderPhone,
              depositAmount: listing.depositAmount,
              location:      listing.location,
              condition:     listing.condition,
            },
          });
        });
    });

    requests.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    res.json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listEquipment,
  getListings,
  getMyListings,
  sendRequest,
  updateRequestStatus,
  confirmReturn,
  getMyRequests,
};
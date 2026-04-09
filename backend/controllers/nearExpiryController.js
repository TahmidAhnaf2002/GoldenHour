const NearExpiry = require('../models/nearExpiryModel');

// Helper — days until expiry
const daysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Helper — category from days
const getCategory = (days) => {
  if (days <= 0)  return 'Expired';
  if (days <= 7)  return 'Critical';
  if (days <= 30) return 'Urgent';
  return 'Soon';
};

// @desc    Post near-expiry medicine
// @route   POST /api/nearexpiry/post
// @access  Private
const postMedicine = async (req, res) => {
  try {
    const {
      facilityName, facilityType, contactNumber, location,
      medicineName, genericName, quantity,
      originalPrice, discountedPrice, expiryDate, description,
    } = req.body;

    const days = daysUntil(expiryDate);
    if (days <= 0) {
      return res.status(400).json({ message: 'Cannot post already expired medicines' });
    }

    const listing = await NearExpiry.create({
      postedBy: req.user._id,
      facilityName,
      facilityType,
      contactNumber,
      location,
      medicineName,
      genericName,
      quantity,
      originalPrice,
      discountedPrice,
      expiryDate,
      description,
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available listings
// @route   GET /api/nearexpiry
// @access  Public
const getListings = async (req, res) => {
  try {
    const { division, category } = req.query;
    const query = { status: 'Available' };
    if (division) query['location.division'] = division;

    let listings = await NearExpiry.find(query).sort({ expiryDate: 1 });

    // attach computed fields
    listings = listings.map((l) => {
      const days = daysUntil(l.expiryDate);
      const cat = getCategory(days);
      return { ...l.toObject(), daysLeft: days, category: cat };
    });

    // auto-filter out expired
    listings = listings.filter((l) => l.daysLeft > 0);

    if (category) {
      listings = listings.filter((l) => l.category === category);
    }

    res.json({ count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my posted listings
// @route   GET /api/nearexpiry/mine
// @access  Private
const getMyListings = async (req, res) => {
  try {
    let listings = await NearExpiry.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });

    listings = listings.map((l) => {
      const days = daysUntil(l.expiryDate);
      return { ...l.toObject(), daysLeft: days, category: getCategory(days) };
    });

    res.json({ count: listings.length, listings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Claim a medicine listing
// @route   POST /api/nearexpiry/:id/claim
// @access  Private
const claimMedicine = async (req, res) => {
  try {
    const listing = await NearExpiry.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'Available') {
      return res.status(400).json({ message: 'This medicine is no longer available' });
    }

    const days = daysUntil(listing.expiryDate);
    if (days <= 0) {
      return res.status(400).json({ message: 'This medicine has already expired' });
    }

    const alreadyClaimed = listing.claims.find(
      (c) =>
        c.claimedBy.toString() === req.user._id.toString() &&
        ['Pending', 'Confirmed'].includes(c.status)
    );
    if (alreadyClaimed) {
      return res.status(400).json({ message: 'You already have an active claim on this item' });
    }

    const { claimerType, contactNumber, unitsRequested, note } = req.body;
    const units = Number(unitsRequested) || 1;

    if (units > listing.quantity) {
      return res.status(400).json({ message: `Only ${listing.quantity} units available` });
    }

    listing.claims.push({
      claimedBy: req.user._id,
      claimedByName: req.user.name,
      claimerType: claimerType || 'Patient',
      contactNumber,
      unitsRequested: units,
      note: note || '',
    });

    listing.status = 'Claimed';
    await listing.save();

    res.json({ message: 'Claim submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update claim status (poster only)
// @route   PUT /api/nearexpiry/:id/claims/:claimId/status
// @access  Private
const updateClaimStatus = async (req, res) => {
  try {
    const listing = await NearExpiry.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const claim = listing.claims.id(req.params.claimId);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const newStatus = req.body.status;

    if (newStatus === 'Picked Up') {
      listing.status = 'Picked Up';
    }

    if (newStatus === 'Cancelled' && ['Pending', 'Confirmed'].includes(claim.status)) {
      listing.status = 'Available';
    }

    claim.status = newStatus;
    await listing.save();

    res.json({ message: 'Claim status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove/cancel a posting
// @route   PUT /api/nearexpiry/:id/remove
// @access  Private
const removeListing = async (req, res) => {
  try {
    const listing = await NearExpiry.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    listing.status = 'Removed';
    await listing.save();

    res.json({ message: 'Listing removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get waste saved stats
// @route   GET /api/nearexpiry/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const pickedUp = await NearExpiry.find({ status: 'Picked Up' });
    const totalSaved = pickedUp.reduce((sum, l) => sum + l.quantity, 0);
    const totalListings = await NearExpiry.countDocuments();
    const activeListings = await NearExpiry.countDocuments({ status: 'Available' });

    res.json({ totalSaved, totalListings, activeListings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my claims
// @route   GET /api/nearexpiry/claims/mine
// @access  Private
const getMyClaims = async (req, res) => {
  try {
    const listings = await NearExpiry.find({
      'claims.claimedBy': req.user._id,
    });

    const claims = [];
    listings.forEach((l) => {
      l.claims
        .filter((c) => c.claimedBy.toString() === req.user._id.toString())
        .forEach((c) => {
          claims.push({
            claimId: c._id,
            status: c.status,
            unitsRequested: c.unitsRequested,
            claimedAt: c.claimedAt,
            daysLeft: daysUntil(l.expiryDate),
            listing: {
              id: l._id,
              medicineName: l.medicineName,
              genericName: l.genericName,
              discountedPrice: l.discountedPrice,
              expiryDate: l.expiryDate,
              facilityName: l.facilityName,
              contactNumber: l.contactNumber,
              location: l.location,
            },
          });
        });
    });

    claims.sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));
    res.json({ count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  postMedicine,
  getListings,
  getMyListings,
  claimMedicine,
  updateClaimStatus,
  removeListing,
  getStats,
  getMyClaims,
};
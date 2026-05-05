const EmergencyId = require('../models/emergencyIdModel');

const saveProfile = async (req, res) => {
  try {
    const {
      name, dateOfBirth, bloodType, gender, weight, address,
      allergies, chronicConditions, currentMedications,
      emergencyContacts, organDonor, dnrOrder, publicFields,
    } = req.body;

    let profile = await EmergencyId.findOne({ user: req.user._id });
    if (profile) {
      profile.name = name;
      profile.dateOfBirth = dateOfBirth || '';
      profile.bloodType = bloodType || '';
      profile.gender = gender || '';
      profile.weight = weight || '';
      profile.address = address || '';
      profile.allergies = allergies || [];
      profile.chronicConditions = chronicConditions || [];
      profile.currentMedications = currentMedications || [];
      profile.emergencyContacts = emergencyContacts || [];
      profile.organDonor = organDonor ?? false;
      profile.dnrOrder = dnrOrder ?? false;
      if (publicFields) profile.publicFields = { ...profile.publicFields, ...publicFields };
      await profile.save();
    } else {
      profile = await EmergencyId.create({
        user: req.user._id,
        name, dateOfBirth, bloodType, gender, weight, address,
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        currentMedications: currentMedications || [],
        emergencyContacts: emergencyContacts || [],
        organDonor: organDonor ?? false,
        dnrOrder: dnrOrder ?? false,
        publicFields: publicFields || {},
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await EmergencyId.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scanProfile = async (req, res) => {
  try {
    const profile = await EmergencyId.findOne({
      emergencyId: req.params.emergencyId,
      isActive: true,
    });
    if (!profile) return res.status(404).json({ message: 'Emergency ID not found or inactive' });

    profile.scanCount += 1;
    profile.lastScanned = new Date();
    await profile.save();

    const pub = profile.publicFields;
    const publicData = {
      emergencyId: profile.emergencyId,
      name: profile.name,
      bloodType: pub.bloodType ? profile.bloodType : null,
      gender: profile.gender,
      dateOfBirth: pub.dateOfBirth ? profile.dateOfBirth : null,
      weight: pub.weight ? profile.weight : null,
      address: pub.address ? profile.address : null,
      allergies: pub.allergies ? profile.allergies : [],
      chronicConditions: pub.chronicConditions ? profile.chronicConditions : [],
      currentMedications: pub.currentMedications ? profile.currentMedications : [],
      emergencyContacts: pub.emergencyContacts ? profile.emergencyContacts : [],
      organDonor: profile.organDonor,
      dnrOrder: profile.dnrOrder,
      lastUpdated: profile.updatedAt,
    };
    res.json(publicData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const profile = await EmergencyId.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.isActive = !profile.isActive;
    await profile.save();
    res.json({ message: `Profile ${profile.isActive ? 'activated' : 'deactivated'}`, isActive: profile.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveProfile, getMyProfile, scanProfile, toggleActive };
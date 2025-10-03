const { ObjectId } = require('mongodb');
const { mongoDB } = require('../data/database');

const getAllProfiles = async (req, res) => {
  try {
    const db = await mongoDB();
    const profiles = await db.collection('history').find().toArray();
    res.status(200).json(profiles);
  } catch (err) {
    console.error('Error in getAllProfiles:', err.message);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const db = await mongoDB();
    const profile = await db.collection('history').findOne({ _id: new ObjectId(id) });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json(profile);
  } catch (err) {
    console.error('Error in getProfileById:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const createProfile = async (req, res) => {
  try {
    const { chronicMedication, allergies, nextOfKin, phoneNumber } = req.body;
    if (!chronicMedication || !allergies || !nextOfKin || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await mongoDB();
    const result = await db.collection('history').insertOne({
      chronicMedication,
      allergies,
      nextOfKin,
      phoneNumber,
      createdAt: new Date(),
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error('Error in createProfile:', err.message);
    res.status(500).json({ error: 'Failed to create profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const { chronicMedication, allergies, nextOfKin, phoneNumber } = req.body;
    const updateFields = {};
    if (chronicMedication) updateFields.chronicMedication = chronicMedication;
    if (allergies) updateFields.allergies = allergies;
    if (nextOfKin) updateFields.nextOfKin = nextOfKin;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;

    if (Object.keys(updateFields).length === 0)
      return res.status(400).json({ error: 'At least one field must be provided' });

    const db = await mongoDB();
    const result = await db.collection('history').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Profile not found' });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error in updateProfile:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const db = await mongoDB();
    const result = await db.collection('history').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Profile not found' });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error in deleteProfile:', err.message);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};

module.exports = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};

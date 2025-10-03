const { ObjectId } = require('mongodb');
const { mongoDB } = require('../data/database');

const getAllUsers = async (req, res) => {
  try {
    const db = await mongoDB();
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error in getAllUsers:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const db = await mongoDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error in getUserById:', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { patientName, company, position, gender, ageGroup, email } = req.body;

    if (!patientName || !company || !position || !gender || !ageGroup || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender. Must be Male, Female, or Other' });
    }

    const validAgeGroups = ['18-30', '31-50', '51+'];
    if (!validAgeGroups.includes(ageGroup)) {
      return res.status(400).json({ error: 'Invalid ageGroup. Must be 18-30, 31-50, or 51+' });
    }

    const db = await mongoDB();
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const result = await db.collection('users').insertOne({
      patientName,
      company,
      position,
      gender,
      ageGroup,
      email,
      createdAt: new Date(),
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error('Error in createUser:', err.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const { patientName, company, position, gender, ageGroup, email } = req.body;

    const updateFields = {};
    if (patientName) updateFields.patientName = patientName;
    if (company) updateFields.company = company;
    if (position) updateFields.position = position;
    if (gender) {
      const validGenders = ['Male', 'Female', 'Other'];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({ error: 'Invalid gender. Must be Male, Female, or Other' });
      }
      updateFields.gender = gender;
    }
    if (ageGroup) {
      const validAgeGroups = ['18-30', '31-50', '51+'];
      if (!validAgeGroups.includes(ageGroup)) {
        return res.status(400).json({ error: 'Invalid ageGroup. Must be 18-30, 31-50, or 51+' });
      }
      updateFields.ageGroup = ageGroup;
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      updateFields.email = email;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }


    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('Error in updateUser:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const db = await mongoDB();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('Error in deleteUser:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

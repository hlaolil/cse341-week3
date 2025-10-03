const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env');
}

const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});

let db;

async function mongoDB() {
  if (!db || !client.topology.isConnected()) {
    try {
      await client.connect();
      db = client.db('tlokza_db_user');
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err.message);
      throw err;
    }
  }
  return db;
}

module.exports = { mongoDB, client };

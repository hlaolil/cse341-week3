const express = require('express');
const cors = require('cors');
const { mongoDB, client } = require('./data/database');
const usersRoutes = require('./routes/users');
const setupSwagger = require('./swagger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

app.use(cors({ origin: ['http://localhost:3000', 'https://your-render-url.onrender.com'] }));
app.use(express.json());

// Root info
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Grace Pharmacy Users API',
    endpoints: {
      users: '/users',
      userById: '/users/:id',
      documentation: '/api-docs',
    },
    documentation: 'Visit /api-docs for interactive API documentation',
  });
});

// Routes
app.use('/users', usersRoutes);

// Swagger docs
setupSwagger(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, async () => {
  try {
    await mongoDB();
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📘 Swagger docs available at http://localhost:${PORT}/api-docs`);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

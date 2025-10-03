require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
const GithubStrategy = require('passport-github2').Strategy;
const { mongoDB, client } = require('./data/database');
const usersRoutes = require('./routes/users');
const setupSwagger = require('./swagger');
const profilesRoutes = require('./routes/profiles');
const User = require('./models/User'); // Make sure this exists



const app = express();
const PORT = process.env.PORT || 3000;

// Ensure MongoDB URI is set
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

// ---------------------------
// Middleware
// ---------------------------
app.use(cors({
  origin: ['http://localhost:3000', 'https://cse341-week3-3vcu.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// ---------------------------
// Auth Routes
// ---------------------------
app.get("/", (req, res) => {
  res.send('<a href="/github">Login with GitHub</a>');
});

// GitHub login
app.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub callback
app.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => res.redirect("/dashboard")
);

// Logout
app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Protected dashboard route
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.send(`Hello ${req.user.name}, welcome to your dashboard!`);
});

// ---------------------------
// Protect middleware for API routes
// ---------------------------
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

// ---------------------------
// API Routes
// ---------------------------
app.use('/users', usersRoutes);
app.use('/profiles', profilesRoutes);
// Swagger docs
setupSwagger(app);

// ---------------------------
// Error Handling
// ---------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ---------------------------
// Start server
// ---------------------------
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

// ---------------------------
// Graceful shutdown
// ---------------------------
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const { mongoDB } = require("../data/database");

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const db = await mongoDB();
      const usersCollection = db.collection("users");

      // Find user
      let user = await usersCollection.findOne({ githubId: profile.id });

      if (!user) {
        // Insert new user
        const newUser = {
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value || "no-email@github.com",
          createdAt: new Date()
        };
        await usersCollection.insertOne(newUser);
        user = newUser;
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize/Deserialize with raw MongoDB
passport.serializeUser((user, done) => {
  done(null, user.githubId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await mongoDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ githubId: id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const session = require("express-session");

const app = express();

//Middleware
const passUserToView = require("./middleware/pass-user-to-view.js");
const isSignedIn = require("./middleware/is-signed-in.js");

//Controllers
const authController = require("./controllers/auth.js"); // auth router holds all the auth endpoints
const vipsController = require("./controllers/vips.js");

// Set the port from environment variable or default to 3000 -ternary statement
const port = process.env.PORT ? process.env.PORT : "3000";

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Core Middleware
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

// Custom Middleware
app.use(passUserToView);

// Mount Controllers
app.use("/auth", authController);
app.use("/vip-lounge", isSignedIn, vipsController);

// GET / Home Route
app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

// Wildcard
app.get('/*spat', async (req, res) => {
  try {
    console.warn(`Unknown route accessed: ${req.originalUrl}`);
    res.redirect("/");
  } catch (err) {
    console.error("Error handling unknown route:", err);
    res.status(500).send("Something went wrong. Please try again.");
  }
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});

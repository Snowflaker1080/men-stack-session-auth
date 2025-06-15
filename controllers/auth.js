const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user.js");

//__ROUTER__//

// GET sign-up form
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

// POST sign-up form
router.post("/sign-up", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });

  if (userInDatabase) {
    return res.send("Username already taken");
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Passwords do not match");
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10); //salting
  req.body.password = hashedPassword;

  const user = await User.create(req.body);
  res.send(`Thanks for signing up ${user.username}`);
});

// GET sign-in form
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

// POST sign-in form
router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });

  if (!userInDatabase) {
    return res.send("Login failed. Please try again.");
  }

  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );
  if (!validPassword) {
    return res.send("Login failed. Please try again.");
  }

  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id,
  };

  req.session.save(() => {
    //not matching
    res.redirect("/");
  });
});

// GET sign-out
router.get("/sign-out", (req, res) => {
  req.session.destroy((err) => {
     if (err) console.error(err);
    res.redirect("/");
  });
});

module.exports = router;

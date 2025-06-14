const express = require("express");
const router = express.Router();

// GET /vip-lounge/
router.get("/", (req, res) => {
  const username = res.locals.user?.username || "Guest";
  res.render("vip-lounge.ejs", {
    message: `Welcome to the VIP Lounge, ${username}.`,
  });
});

module.exports = router;
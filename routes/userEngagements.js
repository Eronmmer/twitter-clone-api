const express = require("express");
const router = express.Router();
const authenticator = require( "../middleware/authenticator" );

/*
there will be 
- follow users, unfollow
- block user(. once you block, once you block you unfollow but not the otherway round), unblock
- mute user, unmute
- turn on post notifications(you must be following and not blocked), turn off
 */

// follow 
router.put("/follow/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

// unfollow 
router.put("/unfollow/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

// block a user
router.put("/block/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

// unblock a user
router.put("/unblock/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

// mute a user
router.put("/mute/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

// unmute a user
router.put("/unmute/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

// turn on notifications for a user
router.put("/notificationsOn/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

// turn off notifications
router.put("/notificationsOff/userId", authenticator, (req, res) => {
  res.send("user engagements bitch");
});

module.exports = router;

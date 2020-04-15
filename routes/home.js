const express = require("express");
const router = express.Router();
const { latestTweets } = require("../controllers/home");
const authenticator = require("../middleware/authenticator");

/*
 * @desc Gets latest Tweets
 * @method GET
 * @api Private
*/
router.get("/latest", authenticator, latestTweets);

module.exports = router;

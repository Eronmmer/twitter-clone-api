const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const { allTweets, allLikes, getBio, editBio } = require("../controllers/users");

/*
 * @desc Get all tweets of a user including retweets.
 * To get all of the users comments or replies too, add
 * an include query with a value of replies. `/allTweets?include=replies`
 * @method GET
 * @api public
 */
router.get("/tweets/:userId", allTweets);

/*
 * @desc Get all likes by a user
 * @method GET
 * @api public
 */
router.get("/likes/:userId", allLikes);

/*
 * @desc Get bio of any user
 * @method GET
 * @api public
 */
router.get("/bio/:userId", getBio);

/*
 * @desc Edit the current user bio
 * @method PUT
 * @api private
 */
router.put("/bio", authenticator, editBio);

module.exports = router;

const express = require("express");
const router = express.Router();
const { search } = require("../controllers/search");

// search functionality is limited(will probably improve this later)
// users can search generally(both tweets and users will be fetched),
// for tweets, for users, for tweets based on the author of the tweet, for tweets based on when they were made

/*
 * @desc Search for tweets
 * @method GET
 * @api public
 */

router.get("/:match", search);

module.exports = router;

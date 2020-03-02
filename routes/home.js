const express = require("express");
const router = express.Router();

/* 
  There will be two routes here. One that shows latest tweets and another that shows top tweets. Latest tweets show tweets as they happen immediately. Top tweets work this way: Tweets will have points. these points will be based on the engagements(comments, likes, retweets) and the time they were tweeted(most recent tweets will have more points). Tweets with higher points will ranked top and are what users will first see and interact with. there will be at least 100 tweets in a timeline at any point in time. tweets will be owner's tweets and that of their following. Data here will come from the DB of user's and that of their following. they won't be stored obviously
*/

/*
while showing this timeline to users, make sure to exclude those of blocked and muted users.
 */

// top tweets
router.get("/:topTweets", (req, res, next) => {
  res.send("home bitch");
});

// latest tweets
router.get("/:latestTweets", (req, res, next) => {
  res.send("home bitch");
});

module.exports = router;

const express = require("express");
const router = express.Router();

/* 
	There will be two routes here. One that shows latest tweets and another that shows top tweets. Latest tweets show tweets as they happen immediately. Top tweets work this way: Tweets will have points. these points will be based on the engagements(comments, likes, retweets) and the time they were tweeted(most recent tweets will have a little more point cause it makes sense to show users the most recent tweets even if they want to see the top tweets first). Tweets with higher points will ranked top and are what users will first see and interact with. there will be at least 100 tweets in a timeline(or do something like pagination? dunno yet) at any point in time. tweets will be owner's tweets and that of their following. Data here will come from the DB(think of implementing cache?) of the user and that of their following. You can make this more elegant obviously later.
*/

/*
while showing this timeline to users, make sure to exclude those of blocked and muted users(make provision for making this default in some other way later).
 */

// top tweets
router.get("/:top", (req, res, next) => {
	res.send("home bitch");
});

// latest tweets
router.get("/:latest", (req, res, next) => {
	res.send("home bitch");
});

module.exports = router;

const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator")

// get all of own tweets(with retweets)
router.get("/", authenticator, (req, res) => {
  res.send("posts");
});

// get the tweets of another user(with retweets)
// make sure not to show, if the user is blocked(if user is authenticated).
router.get("/:userId", (req, res) => {
  res.send("posts");
});

// get a particular tweet(anybody)
router.get("/:tweetId", (req, res) => {
  res.send("posts");
});

// make a tweet
router.post("/", authenticator, (req, res) => {
  res.send("posts. POST");
});

// edit a tweet content(by the author)
router.put("/content/:tweetId", authenticator, (req, res) => {
  res.send("posts. PUT");
} );

// like a tweet
// if user has liked the tweet before, unlike it
router.put("/like/:tweetId", authenticator, (req, res) => {
  res.send("posts. PUT");
} );

// comment on a tweet
router.put("/comment/:tweetId", authenticator, (req, res) => {
  res.send("posts. PUT");
} );

// retweet tweet. 
// if user has done so before, undo retweet
router.put("/retweet/:tweetId", authenticator, (req, res) => {
  res.send("posts. PUT");
} );


// delete a tweet
router.delete("/delete/tweetId", authenticator, (req, res) => {
  res.send("posts. DELETE");
} );

// delete all your tweets
router.delete("/deleteAll", authenticator, (req, res) => {
  res.send("posts. DELETE");
} );


module.exports = router;

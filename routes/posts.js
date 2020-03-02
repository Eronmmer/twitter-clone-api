const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { check, validationResult } = require("express-validator");

// get a particular tweet(anybody)
router.get("/:tweetId", async (req, res, next) => {
  try {
    const tweet =
      (await Post.findById(req.params.tweetId)) ||
      (await Comment.findById(req.params.tweetId));
    if (!tweet) {
      return res.status(404).send("This Tweet is not available!");
    }
    res.status(200).json({ tweet });
  } catch (err) {
    if ((err.kind = "ObjectId")) {
      return res.status(404).send("This Tweet is not available!");
    }
    next(err);
  }
});

// make a tweet
router.post(
  "/",
  [
    check("postContent", "Please add something to your post")
      .not()
      .isEmpty(),
    authenticator
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const user = req.user.id;
      const { postContent } = req.body;
      const newPost = new Post({
        postContent,
        user
      });

      const tweet = await newPost.save();
      res.status(200).json({ tweet });
    } catch (err) {
      next(err);
    }
  }
);

// quote a tweet.
router.post(
  "/quote/:tweetId",
  [check("postContent", "Please add something to your post"), authenticator],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const tweetToQuote =
        (await Post.findById(req.params.tweetId)) ||
        (await Comment.findById(req.params.tweetId));
      if (!tweetToQuote) {
        return res.status(404).send("This tweet is not available!");
      }
      const { postContent } = req.body;
      const user = req.user.id;
      const tweet = new Post({
        postContent,
        user,
        quotedReply: true,
        replyQuoted: req.params.tweetId,
        onModelQuoted: tweetToQuote.tweetType
      });

      await tweet.save();
      // add this tweet to the quoted Tweet's quotedTweets 😁
      tweetToQuote.quotedReplies.unshift(tweet.id);
      await tweetToQuote.save();
      res.json({ tweet, tweetQuoted: tweetToQuote });
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).send("This tweet is not available");
      }
      next(err);
    }
  }
);

// edit a tweet content(by the author)
router.put(
  "/content/:tweetId",
  [
    check("postContent", "Please add a post content")
      .not()
      .isEmpty(),
    authenticator
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const tweet =
        (await Post.findById(req.params.tweetId)) ||
        (await Comment.findById(req.params.tweetId));
      if (!tweet) {
        return res.status(404).send("This tweet is not available");
      }
      if (tweet.user.toString() !== req.user.id) {
        return res.status(401).send("Not authorized!");
      }

      const { postContent } = req.body;
      tweet.postContent = postContent;
      tweet.edited = true;
      await tweet.save();
      res.json({ tweet });
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).send("This tweet is not available!");
      }
      next(err);
    }
  }
);

// like a tweet
router.put("/like/:tweetId", authenticator, async (req, res, next) => {
  try {
    const user = req.user.id;
    const tweet =
      (await Post.findById(req.params.tweetId)) ||
      (await Comment.findById(req.params.tweetId));
    if (!tweet) {
      return res.status(404).send("This tweet is not available");
    }
    // check if tweet has already been liked by this user
    if (tweet.likes.filter(like => like.toString() === user).length > 0) {
      return res.status(400).send("Tweet has already been liked by you!");
    }
    tweet.likes.unshift(user);
    await tweet.save();

    // add to user's likes
    const findUser = await User.findById(user);
    findUser.likes.unshift(req.params.tweetId);
    await findUser.save();
    res.json({ likes: tweet.likes });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This tweet is not available!");
    }
    next(err);
  }
});

// unlike a tweet
router.put("/unlike/:tweetId", authenticator, async (req, res, next) => {
  try {
    const user = req.user.id;
    const tweet =
      (await Post.findById(req.params.tweetId)) ||
      (await Comment.findById(req.params.tweetId));

    if (!tweet) {
      return res.status(404).send("This tweet is not available");
    }
    // check is user hasn't liked already
    if (tweet.likes.filter(like => like.toString() === user).length === 0) {
      return res
        .status(400)
        .send("You can't unlike what you haven't liked fella...");
    }
    const index = tweet.likes.findIndex(e => e.toString() === user);
    tweet.likes.splice(index, 1);
    tweet.save();

    // remove from user's likes
    const findUser = await User.findById(user);
    const userIndex = findUser.likes.findIndex(e => e.toString() === user);
    findUser.likes.splice(userIndex, 1);
    await findUser.save();
    res.json({ likes: tweet.likes });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This tweet is not available");
    }
    next(err);
  }
});

// comment on a tweet or comment
router.post(
  "/comment/:tweetId",
  [
    check("postContent", "Please add something to your post")
      .not()
      .isEmpty(),
    authenticator
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const tweet =
        (await Post.findById(req.params.tweetId)) ||
        (await Comment.findById(req.params.tweetId));

      if (!tweet) {
        return res.status(404).send("This tweet is not available");
      }
      const { postContent, commentedOn, onModel } = req.body;
      const comment = new Comment({
        postContent,
        user: req.user.id,
        commentedOn: req.params.tweetId,
        onModel: tweet.tweetType
      });

      await comment.save();
      // inject comment into parent tweet
      tweet.comments.unshift(comment.id);
      await tweet.save();
      res.json({ allComments: tweet.comments, commentSent: comment });
    } catch (err) {
      if (err.kind === "ObjectId") {
        return res.status(404).send("This tweet is unavailable");
      }
      next(err);
    }
  }
);

// retweet tweet.
router.put("/retweet/:tweetId", authenticator, async (req, res, next) => {
  try {
    const user = req.user.id;
    const tweet =
      (await Post.findById(req.params.tweetId)) ||
      (await Comments.findById(req.params.tweetId));
    if (!tweet) {
      return res.status(404).send("This tweet is not available");
    }
    // check if tweet has already been retweeted by this user
    if (
      tweet.retweets.filter(retweet => retweet.toString() === user).length > 0
    ) {
      return res.status(400).send("Tweet has already been retweeted by you!");
    }
    tweet.retweets.unshift(user);
    await tweet.save();

    // add retweet to user's tweets
    const findUser = await User.findById(user);
    findUser.tweets.unshift(req.params.tweetId);
    await findUser.save();
    res.json({ retweets: tweet.retweets });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This tweet is not available!");
    }
    next(err);
  }
});

// undoretweet tweet.
router.put("/unretweet/:tweetId", authenticator, async (req, res, next) => {
  try {
    const user = req.user.id;
    const tweet =
      (await Post.findById(req.params.tweetId)) ||
      (await Comment.findById(req.params.tweetId));

    if (!tweet) {
      return res.status(404).send("This tweet is not available");
    }
    // check is user hasn't retweeted already
    if (
      tweet.retweets.filter(retweet => retweet.toString() === user).length === 0
    ) {
      return res
        .status(400)
        .send("You can't unretweet what you haven't retweeted fella...");
    }
    const index = tweet.retweets.findIndex(e => e.toString() === user);
    tweet.retweets.splice(index, 1);
    tweet.save();

    // remove from user's tweets
    const findUser = await User.findById(user);
    const userIndex = findUser.tweets.findIndex(e => e.toString() === user);
    findUser.tweets.splice(userIndex, 1);
    await findUser.save();
    res.json({ retweets: tweet.retweets });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This tweet is not available");
    }
    next(err);
  }
});

// delete a tweet
router.delete("/delete/:tweetId", authenticator, async (req, res, next) => {
  try {
    const tweet =
      (await Post.findById(req.params.tweetId)) ||
      (await Comment.findById(req.params.tweetId));
    if (!tweet) {
      return res.status(404).send("This tweet is not available!");
    }
    if (tweet.user.toString() !== req.user.id) {
      return res.status(401).send("Not authorized!");
    }
    await tweet.remove();

    // remove this tweet from everywhere else(tweeter's tweets, likes, retweets, etc)
    res.status(200).send("Post successfully deleted");
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send("This tweet is not available!");
    }
    next(err);
  }
});

// delete all your tweets
router.delete("/delete/deleteAll", authenticator, (req, res, next) => {
  res.send("delete all your tweets");
});

module.exports = router;

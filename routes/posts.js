const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { check, validationResult } = require("express-validator");
const { checkIfNotUser } = require("../utils");

// get a particular tweet(anybody)
router.get("/:tweetId", async (req, res, next) => {
	try {
		const tweet =
			(await Post.findById(req.params.tweetId)) ||
			(await Comment.findById(req.params.tweetId));
		if (!tweet) {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}

		const {
			user,
			edited,
			postContent,
			likes,
			retweets,
			quotedReplies,
			comments,
			tweetType,
			date,
		} = tweet;
		if (tweetType === "posts") {
			const { quotedReply, onModelQuoted, replyQuoted } = tweet;
			return res.status(200).json({
				data: {
					tweet: {
						user,
						edited,
						postContent,
						tweetType,
						likes,
						retweets,
						quotedReplies,
						comments,
						date,
						quotedReply,
						onModelQuoted,
						replyQuoted,
					},
				},
			});
		} else {
			const { commentedOn, monModel } = tweet;
			return res.status(200).json({
				data: {
					tweet: {
						user,
						edited,
						postContent,
						likes,
						retweets,
						quotedReplies,
						comments,
						tweetType,
						date,
						commentedOn,
						monModel,
					},
				},
			});
		}
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
});

// make a tweet
router.post(
	"/",
	[
		check("postContent", "Please add something to your post").not().isEmpty(),
		authenticator,
	],
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		try {
			const user = await User.findById(req.user.id);
			checkIfNotUser(user, res);
			const { postContent } = req.body;
			const newPost = new Post({
				postContent,
				user,
			});

			const tweet = await newPost.save();
			res.status(200).json({
				data: {
					tweet,
				},
			});
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
			const user = await User.findById(req.user.id);
			checkIfNotUser(user, res);
			const tweetToQuote =
				(await Post.findById(req.params.tweetId)) ||
				(await Comment.findById(req.params.tweetId));
			if (!tweetToQuote) {
				return res.status(404).json({
					errors: [
						{
							msg: "Tweet not found",
							status: "404",
						},
					],
				});
			}
			const { postContent } = req.body;
			const tweet = new Post({
				postContent,
				user: user.id,
				quotedReply: true,
				replyQuoted: req.params.tweetId,
				onModelQuoted: tweetToQuote.tweetType,
			});

			await tweet.save();
			// add this tweet to the quoted Tweet's quotedTweets 😁
			tweetToQuote.quotedReplies.unshift(tweet.id);
			await tweetToQuote.save();
			res.json({ data: { tweet, quoted: tweetToQuote } });
		} catch (err) {
			if (err.kind === "ObjectId") {
				return res.status(404).json({
					errors: [
						{
							msg: "Tweet not found",
							status: "404",
						},
					],
				});
			}
			next(err);
		}
	}
);

// edit a tweet content(by the author)
router.put(
	"/content/:tweetId",
	[
		check("postContent", "Please add a post content").not().isEmpty(),
		authenticator,
	],
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const user = await User.findById(req.user.id);
			checkIfNotUser(user, res);
			const tweet =
				(await Post.findById(req.params.tweetId)) ||
				(await Comment.findById(req.params.tweetId));
			if (!tweet) {
				return res.status(404).json({
					errors: [
						{
							msg: "Tweet not found",
							status: "404",
						},
					],
				});
			}
			if (tweet.user.toString() !== req.user.id) {
				return res.status(401).json({
					errors: [
						{
							msg: "Not authorized",
							status: "401",
						},
					],
				});
			}

			const { postContent } = req.body;
			tweet.postContent = postContent;
			tweet.edited = true;
			await tweet.save();
			res.json({ data: { tweet } });
		} catch (err) {
			if (err.kind === "ObjectId") {
				return res.status(404).json({
					errors: [
						{
							msg: "Tweet not found",
							status: "404",
						},
					],
				});
			}
			next(err);
		}
	}
);

// like a tweet
router.put("/like/:tweetId", authenticator, async (req, res, next) => {
	try {
		const user = req.user.id;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res);
		const tweet =
			(await Post.findById(req.params.tweetId)) ||
			(await Comment.findById(req.params.tweetId));
		if (!tweet) {
			return res.status(404).send("This tweet is not available");
		}
		// check if tweet has already been liked by this user
		if (tweet.likes.filter((like) => like.toString() === user).length > 0) {
			return res.status(400).json({
				errors: [
					{
						msg: "Not allowed",
						status: "400",
					},
				],
			});
		}
		tweet.likes.unshift(user);
		await tweet.save();

		// add to user's likes
		findUser.likes.unshift(req.params.tweetId);
		await findUser.save();
		res.json({ data: { likes: tweet.likes } });
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
});

// unlike a tweet
router.put("/unlike/:tweetId", authenticator, async (req, res, next) => {
	try {
		const user = req.user.id;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res);
		const tweet =
			(await Post.findById(req.params.tweetId)) ||
			(await Comment.findById(req.params.tweetId));

		if (!tweet) {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		// check is user hasn't liked already
		if (tweet.likes.filter((like) => like.toString() === user).length === 0) {
			return res.status(400).json({
				errors: [
					{
						msg: "Not allowed",
						status: "400",
					},
				],
			});
		}
		const index = tweet.likes.findIndex((e) => e.toString() === user);
		tweet.likes.splice(index, 1);
		tweet.save();

		// remove from user's likes
		const userIndex = findUser.likes.findIndex(
			(e) => e.toString() === req.params.tweetId
		);
		findUser.likes.splice(userIndex, 1);
		await findUser.save();
		res.json({ data: { likes: tweet.likes } });
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
});

// comment on a tweet or comment
router.post(
	"/comment/:tweetId",
	[
		check("postContent", "Please add something to your post").not().isEmpty(),
		authenticator,
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
				return res.status(404).json({
					errors: [
						{
							msg: "Tweet not found",
							status: "404",
						},
					],
				});
			}
			const { postContent } = req.body;
			const comment = new Comment({
				postContent,
				user: req.user.id,
				commentedOn: req.params.tweetId,
				onModel: tweet.tweetType,
			});

			await comment.save();
			// inject comment into parent tweet
			tweet.comments.unshift(comment.id);
			await tweet.save();
			res.json({
				data: {
					allComments: tweet.comments,
					commentSent: comment,
				},
			});
		} catch (err) {
			if (err.kind === "ObjectId") {
				return res.status(404).json({
					errors: [
						{
							msg: "Tweet not found",
							status: "404",
						},
					],
				});
			}
			next(err);
		}
	}
);

// retweet tweet.
router.put("/retweet/:tweetId", authenticator, async (req, res, next) => {
	try {
		const user = req.user.id;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res);
		const tweet =
			(await Post.findById(req.params.tweetId)) ||
			(await Comment.findById(req.params.tweetId));
		if (!tweet) {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		// check if tweet has already been retweeted by this user
		if (
			tweet.retweets.filter((retweet) => retweet.toString() === user).length > 0
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "Not allowed",
						status: "400",
					},
				],
			});
		}
		tweet.retweets.unshift(user);
		await tweet.save();

		// add retweet to user's tweets
		findUser.tweets.unshift(req.params.tweetId);
		await findUser.save();
		res.json({ data: { retweets: tweet.retweets } });
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
});

// undoretweet
router.put("/unretweet/:tweetId", authenticator, async (req, res, next) => {
	try {
		const user = req.user.id;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res);
		const tweet =
			(await Post.findById(req.params.tweetId)) ||
			(await Comment.findById(req.params.tweetId));

		if (!tweet) {
			return res.status(404).json({
				errors: [{ msg: "Tweet not found", status: "404" }],
			});
		}
		// check is user hasn't retweeted already
		if (
			tweet.retweets.filter((retweet) => retweet.toString() === user).length ===
			0
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "Tweet hasn't been retweeted",
						status: "400",
					},
				],
			});
		}
		const index = tweet.retweets.findIndex((e) => e.toString() === user);
		tweet.retweets.splice(index, 1);
		tweet.save();

		// remove from user's tweets
		const userIndex = findUser.tweets.findIndex(
			(e) => e.toString() === req.params.tweetId
		);
		findUser.tweets.splice(userIndex, 1);
		await findUser.save();
		res.json({ data: { retweets: tweet.retweets } });
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
});

// delete a tweet
router.delete("/delete/:tweetId", authenticator, async (req, res, next) => {
	try {
		const user = req.user.id;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res);
		const tweet =
			(await Post.findById(req.params.tweetId)) ||
			(await Comment.findById(req.params.tweetId));
		if (!tweet) {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		if (tweet.user.toString() !== req.user.id) {
			return res.status(401).json({
				errors: [
					{
						msg: "Not authorized",
						status: "401",
					},
				],
			});
		}
		await tweet.remove();

		// remove this tweet from everywhere else(tweeter's tweets, likes, retweets, etc)
		res.json({
			data: {
				msg: "Tweet deleted"
			}
		});
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "Tweet not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
});

module.exports = router;

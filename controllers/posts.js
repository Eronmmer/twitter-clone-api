const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { validationResult } = require("express-validator");
const {
	checkIfNotUser,
	objectIdError,
	checkIfAuthenticated,
} = require("../utils");

exports.getTweet = async (req, res, next) => {
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

		// if authenticated, check if user blocked requester
		if (checkIfAuthenticated(req)) {
			const findUserId = tweet.user;
			const findUser = await User.findById(findUserId);
			const authenticatedUser = await User.findById(checkIfAuthenticated(req));
			checkIfNotUser(authenticatedUser, res);
			if (findUser.blocked.includes(authenticatedUser.id)) {
				return res.status(403).json({
					errors: [
						{
							msg: "You're blocked from viewing this user's tweets",
							status: "403",
						},
					],
				});
			}
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
			const { commentedOn, onModel } = tweet;
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
						onModel,
					},
				},
			});
		}
	} catch (err) {
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.createTweet = async (req, res, next) => {
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
			user: user.id,
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
};

exports.quoteTweet = async (req, res, next) => {
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

		// Check if user blocked requester
		const tweetOwnerId = tweetToQuote.user;
		const tweetOwner = await User.findById(tweetOwnerId);
		if (tweetOwner.blocked.includes(user.id)) {
			return res.status(403).json({
				errors: [
					{
						msg: "You're blocked from viewing this user's tweets",
						status: "403",
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
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.editTweet = async (req, res, next) => {
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
			return res.status(403).json({
				errors: [
					{
						msg: "Forbidden",
						status: "403",
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
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.likeTweet = async (req, res, next) => {
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
						msg: "This tweet is not available",
						status: "404",
					},
				],
			});
		}

		// Check if user blocked requester
		const tweetOwnerId = tweet.user;
		const tweetOwner = await User.findById(tweetOwnerId);
		if (tweetOwner.blocked.includes(req.user.id)) {
			return res.status(403).json({
				errors: [
					{
						msg: "You're blocked from viewing this user's tweets",
						status: "403",
					},
				],
			});
		}

		// check if tweet has already been liked by this user
		if (tweet.likes.filter((like) => like.toString() === user).length > 0) {
			return res.status(400).json({
				errors: [
					{
						msg: "Already liked",
						status: "400",
					},
				],
			});
		}
		tweet.likes.unshift(user);
		await tweet.save();
		res.json({ data: { likes: tweet.likes } });
	} catch (err) {
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.unlikeTweet = async (req, res, next) => {
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
						msg: "Tweet hasn't been liked",
						status: "400",
					},
				],
			});
		}
		const index = tweet.likes.findIndex((e) => e.toString() === user);
		tweet.likes.splice(index, 1);
		tweet.save();
		res.json({ data: { likes: tweet.likes } });
	} catch (err) {
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.commentOnTweet = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
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
		// check if tweet owner blocked requester
		const tweetOwnerId = tweet.user;
		const tweetOwner = await User.findById(tweetOwnerId);
		if (tweetOwner.blocked.includes(req.user.id)) {
			return res.status(403).json({
				errors: [
					{
						msg: "You're blocked from viewing this user's tweets",
						status: "403",
					},
				],
			});
		}

		const { postContent } = req.body;
		const comment = new Comment({
			postContent,
			user,
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
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.retweet = async (req, res, next) => {
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
		// check if tweet owner blocked requester
		const tweetOwnerId = tweet.user;
		const tweetOwner = await User.findById(tweetOwnerId);
		if (tweetOwner.blocked.includes(req.user.id)) {
			return res.status(403).json({
				errors: [
					{
						msg: "You're blocked from viewing this user's tweets",
						status: "403",
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
						msg: "Already retweeted",
						status: "400",
					},
				],
			});
		}
		tweet.retweets.unshift(user);
		await tweet.save();
		res.json({ data: { retweets: tweet.retweets } });
	} catch (err) {
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.undoRetweet = async (req, res, next) => {
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
		res.json({ data: { retweets: tweet.retweets } });
	} catch (err) {
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

exports.deleteTweet = async (req, res, next) => {
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
			return res.status(403).json({
				errors: [
					{
						msg: "Forbidden",
						status: "403",
					},
				],
			});
		}
		await tweet.remove();
		res.json({
			data: {
				msg: "Tweet deleted",
			},
		});
	} catch (err) {
		objectIdError(res, err, "Tweet not found");
		next(err);
	}
};

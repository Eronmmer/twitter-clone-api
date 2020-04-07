const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { checkIfNotUser } = require("../utils");

// Register a user
exports.register = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	const { name, email, username, password } = req.body;
	try {
		const checkEmail = await User.findOne({ email });
		const checkUsername = await User.findOne({ username });

		if (checkEmail) {
			return res.status(400).json({
				errors: [
					{
						msg: "Email has already been taken",
						status: "400",
					},
				],
			});
		}
		if (checkUsername) {
			return res.status(400).json({
				errors: [
					{
						msg: "Username has already taken",
						status: "400",
					},
				],
			});
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({
			name,
			email,
			username,
			password: hashedPassword,
		});

		await user.save();
		res.status(200).json({
			data: {
				msg: "Account successfully created",
			},
		});
	} catch (err) {
		next(err);
	}
};

// Get all the tweets of a user including retweets and replies(optional)
exports.allTweets = async (req, res, next) => {
	try {
		const user = req.user.id;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res);
		const ownTweets = await Post.find({
			user,
		}).sort({ date: -1 });
		const comments = await Comment.find({
			user,
		}).sort({ date: -1 });
		const postRetweets = await Post.find({
			retweets: user,
		}).sort({ date: -1 });
		const commentRetweets = await Comment.find({
			retweets: user,
		}).sort({ date: -1 });

		const tweets = [...ownTweets, ...postRetweets, ...commentRetweets].sort(
			(a, b) => b.date - a.date
		);
		const tweetsWithReplies = [...tweets, ...comments].sort(
			(a, b) => b.date - a.date
		);
		if (req.query.include === "replies") {
			return res.json({
				data: tweetsWithReplies,
			});
		} else {
			return res.json({
				data: tweets,
			});
		}
	} catch (err) {
		next(err);
	}
};

// Get all likes of a user
exports.allLikes = async (req, res, next) => {
	try {
		const user = req.user.id;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res);
		const postLikes = await Post.find({
			likes: user,
		}).sort({ date: -1 });
		const commentLikes = await Comment.find({
			likes: user,
		}).sort({ date: -1 });

		const likes = [...postLikes, ...commentLikes].sort(
			(a, b) => b.date - a.date
		);

		res.json({
			data: likes,
		});
	} catch (err) {
		next(err);
	}
};

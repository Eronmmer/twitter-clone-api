const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { checkIfNotUser, objectIdError } = require("../utils");

// Get all the tweets of a user including retweets and replies(optional)
exports.allTweets = async (req, res, next) => {
	try {
		const user = req.params.userId;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res, "public");
		const userTweets = await Post.find({
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

		const tweets = [...userTweets, ...postRetweets, ...commentRetweets].sort(
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
		objectIdError(res, err, "User not found");
		next(err);
	}
};

// Get all likes of a user
exports.allLikes = async (req, res, next) => {
	try {
		const user = req.params.userId;
		const findUser = await User.findById(user);
		checkIfNotUser(findUser, res, "public");
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
		objectIdError(res, err, "User not found");
		next(err);
	}
};

// Get the bio of any user
exports.getBio = async (req, res, next) => {
	try {
		const user = await User.findById(req.params.userId);
		checkIfNotUser(user, res, "public");
		const bio = user.bio;
		res.json({ data: { bio } });
	} catch (err) {
		objectIdError(res, err, "User not found");
		next(err);
	}
};

// Edit bio of current user
exports.editBio = async (req, res, next) => {
	const { about, dateOfBirth, website } = req.body;
	try {
		const user = await User.findById(req.user.id);
		checkIfNotUser(user, res);
		if (about) {
			user.bio.about = about;
			await user.save();
		}
		if (dateOfBirth) {
			user.bio.dateOfBirth = dateOfBirth;
			await user.save();
		}
		if (website) {
			user.bio.website = website;
			await user.save();
		}
		res.status(200).json({
			data: {
				bio: user.bio,
			},
		});
	} catch (err) {
		next(err);
	}
};

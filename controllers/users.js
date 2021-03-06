const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { validationResult } = require("express-validator");
const {
	objectIdError,
	checkIfAuthenticated,
	reservedUsernames,
} = require("../utils");

// Get all the tweets of a user including retweets and replies(optional)
exports.allTweets = async (req, res, next) => {
	try {
		const user = req.params.userId;
		const findUser = await User.findById(user);

		// if authenticated, check if user blocked requester
		if (checkIfAuthenticated(req)) {
			if (findUser.blocked.includes(checkIfAuthenticated(req))) {
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

		// if authenticated, check if user blocked requester
		if (checkIfAuthenticated(req)) {
			if (findUser.blocked.includes(checkIfAuthenticated(req))) {
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

// Get the bio of any user by their username
exports.getUserProfile = async (req, res, next) => {
	try {
		const findUser = await User.findOne({ username: req.params.username });

		if (!findUser) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}
		const {
			id,
			name,
			user,
			avatar,
			coverImage,
			username,
			followers,
			following,
			bio,
		} = findUser;
		res.json({
			data: {
				id,
				name,
				user,
				avatar: avatar.url,
				coverImage: coverImage.url,
				username,
				bio,
				followers,
				following,
			},
		});
	} catch (err) {
		objectIdError(res, err, "User not found");
		next(err);
	}
};

// Get the bio of any user by their id
exports.getUserById = async (req, res, next) => {
	try {
		const findUser = await User.findById(req.params.userId);

		const {
			id,
			name,
			user,
			avatar,
			coverImage,
			username,
			followers,
			following,
			bio,
		} = findUser;
		res.json({
			data: {
				id,
				name,
				user,
				avatar: avatar.url,
				coverImage: coverImage.url,
				username,
				bio,
				followers,
				following,
			},
		});
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

// Get the profile of current user
exports.getMyProfile = async (req, res, next) => {
	try {
		const findUser = await User.findById(req.user.id);

		if (findUser.id.toString() !== req.user.id) {
			return res.status(403).json({
				errors: [
					{
						msg: "Forbidden",
						status: "403",
					},
				],
			});
		}
		const {
			id,
			name,
			user,
			avatar,
			coverImage,
			username,
			followers,
			following,
			bio,
			blocked,
			blockedMe,
			muted,
		} = findUser;
		res.json({
			data: {
				id,
				name,
				user,
				avatar: avatar.url,
				coverImage: coverImage.url,
				username,
				bio,
				followers,
				following,
				blocked,
				blockedMe,
				muted,
			},
		});
	} catch (err) {
		next(err);
	}
};

// change name of logged in user
exports.changeName = async (req, res, next) => {
	const { name } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	try {
		const findUser = await User.findById(req.user.id);

		if (findUser.id.toString() !== req.user.id) {
			return res.status(403).json({
				errors: [
					{
						msg: "Forbidden",
						status: "403",
					},
				],
			});
		}
		findUser.name = name;
		await findUser.save();
		res.json({
			data: {
				name: findUser.name,
			},
		});
	} catch (err) {
		next(err);
	}
};

// change username of logged in user
exports.changeUsername = async (req, res, next) => {
	const { username } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	try {
		const findUser = await User.findById(req.user.id);

		if (findUser.id.toString() !== req.user.id) {
			return res.status(403).json({
				errors: [
					{
						msg: "Forbidden",
						status: "403",
					},
				],
			});
		}
		if (reservedUsernames.includes(username.toLowerCase())) {
			return res.status(400).json({
				errors: [
					{
						msg: "This username is unavailable.",
						status: "400",
					},
				],
			});
		}
		findUser.username = username;
		await findUser.save();
		res.json({
			data: {
				username: findUser.username,
			},
		});
	} catch (err) {
		next(err);
	}
};

// Change avatar/profile-pic of current user
exports.changeAvatar = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		const url = req.file.url;
		const id = req.file.public_id;
		user.avatar.url = url;
		user.avatar.id = id;
		await user.save();
		res.json({
			data: {
				url,
			},
		});
	} catch (err) {
		next(err);
	}
};

// Change cover image of current user
exports.changeCoverImage = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		const url = req.file.url;
		const id = req.file.public_id;
		user.coverImage.url = url;
		user.coverImage.id = id;
		await user.save();
		res.json({
			data: {
				url,
			},
		});
	} catch (err) {
		next(err);
	}
};

// Remove avatar of current user
exports.removeAvatar = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		user.avatar.url = process.env.DEFAULT_AVATAR_URL;
		user.avatar.id = process.env.DEFAULT_AVATAR_ID;

		await user.save();
		const { url } = user.avatar;
		res.json({
			data: {
				url,
			},
		});
	} catch (err) {
		next(err);
	}
};

// Remove cover image of current user
exports.removeCoverImage = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		user.coverImage.url = process.env.DEFAULT_COVER_URL;
		user.coverImage.id = process.env.DEFAULT_COVER_ID;

		await user.save();
		const { url } = user.coverImage;
		res.json({
			data: {
				url,
			},
		});
	} catch (err) {
		next(err);
	}
};

// delete account
exports.deleteAccount = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		await user.remove();
		await Post.deleteMany({ user: req.user.id });
		await Comment.deleteMany({ user: req.user.id });
		res.json({
			data: {
				msg: "Account successfully Deleted!",
			},
		});
	} catch (err) {
		next(err);
	}
};

// Change password of logged in user
exports.changePassword = async (req, res, next) => {
	const { oldPassword, newPassword } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	try {
		const user = await User.findById(req.user.id);

		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({
				errors: [
					{
						msg: "The password you entered was incorrect",
						status: "400",
					},
				],
			});
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();
		res.json({
			data: {
				msg: "Password updated successfully",
			},
		});
	} catch (err) {
		next(err);
	}
};

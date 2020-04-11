const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const {
	checkIfAuthenticated,
	checkIfNotUser,
	checkIfBlocked,
} = require("../utils");

// search for tweets
// search queries =>from=account to search tweet from type=type of search to make, tweet or user(tweet by default)
exports.search = async (req, res, next) => {
	try {
		const match = req.params.match;
		const { from, type } = req.query;
		if (type === "user") {
			const users = await User.find({
				$or: [
					{ username: { $regex: new RegExp(`${match}`), $options: "i" } },
					{ name: { $regex: new RegExp(`${match}`), $options: "i" } },
				],
			}).select(["-password", "-blocked", "-blockedMe", "-muted"]);
			// if authenticated, check if user blocked requester
			if (checkIfAuthenticated(req)) {
				const authenticatedUser = await User.findById(req.user.id);
				checkIfNotUser(authenticatedUser, res);
				const usersCopy = [...users];
				usersCopy.forEach((e, i) => {
					if (e.blocked.includes(req.user.id)) {
						usersCopy.splice(i, 1);
					}
				});
				return res.json({
					data: usersCopy,
				});
			}
			return res.json({
				data: users,
			});
		}
		if (from) {
			const user = await User.findOne({ username: from });
			if (!user) {
				return res.json({
					data: [],
				});
			}

			// if authenticated, check if user blocked requester
			if (checkIfAuthenticated(req)) {
				const authenticatedUser = await User.findById(req.user.id);
				checkIfNotUser(authenticatedUser, res);
				// If blocked, return empty data
				if (user.blocked.includes(authenticatedUser.id)) {
					return res.json({
						data: [],
					});
				}
			}

			const tweets = await Post.find({
				"postContent.text": { $regex: new RegExp(`${match}`), $options: "i" },
				user: user.id,
			}).sort({
				date: -1,
			});
			const comments = await Comment.find({
				"postContent.text": { $regex: new RegExp(`${match}`), $options: "i" },
				user: user.id,
			}).sort({ date: -1 });
			const all = [...tweets, ...comments].sort((a, b) => b.date - a.date);
			return res.json({
				data: all,
			});
		} else {
			const tweets = await Post.find({
				"postContent.text": {
					$regex: new RegExp(`${match}`),
					$options: "i",
				},
			}).sort({
				date: -1,
			});
			const comments = await Comment.find({
				"postContent.text": {
					$regex: new RegExp(`${match}`),
					$options: "i",
				},
			}).sort({ date: -1 });
			const all = [...tweets, ...comments].sort((a, b) => b.date - a.date);

			// if authenticated, check if owner of tweet or comment blocked requester
			if (checkIfAuthenticated(req)) {
				const authenticatedUser = await User.findById(req.user.id);
				checkIfNotUser(authenticatedUser, res);
				all.forEach(async (e, i) => {
					const user = await User.findById(e.user);
					if (user.blocked.includes(req.user.id)) {
						all.splice(i, 1);
					}
				});
			}
			return res.json({
				data: all,
			});
		}
	} catch (err) {
		next(err);
	}
};

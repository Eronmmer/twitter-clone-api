const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

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
			return res.json({
				data: all,
			});
		}
	} catch (err) {
		next(err);
	}
};

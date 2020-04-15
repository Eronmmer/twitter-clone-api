const User = require("../models/User");

// Follow a user
exports.follow = async (req, res, next) => {
	try {
		const userToFollow = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!userToFollow) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		// make sure user doesn't follow himself
		if (req.params.userId === req.user.id) {
			return res.status(400).json({
				errors: [
					{
						msg: "You can't follow yourself",
						status: "400",
					},
				],
			});
		}

		// check if user is already following
		if (
			userToFollow.followers.filter((user) => user.toString() === req.user.id)
				.length === 1
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "You're already following this user",
						status: "400",
					},
				],
			});
		}

		userToFollow.followers.unshift(req.user.id);
		user.following.unshift({ user: req.params.userId });
		await userToFollow.save();
		await user.save();
		res.json({
			data: {
				following: user.following,
			},
		});
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
					},
				],
			});
		}
		next(err);
	}
};

// Unfollow a user
exports.unfollow = async (req, res, next) => {
	try {
		const userToUnfollow = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!userToUnfollow) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		// make sure user doesn't unfollow themselves
		if (req.params.userId === req.user.id) {
			return res.status(400).json({
				errors: [
					{
						msg: "You can't unfollow yourself",
						status: "400",
					},
				],
			});
		}

		// check if user is not following
		if (
			userToUnfollow.followers.filter((user) => user.toString() === req.user.id)
				.length === 0
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "You're not following this user",
						status: "400",
					},
				],
			});
		}

		const userToUnfollowIndex = userToUnfollow.followers.findIndex(
			(e) => e.toString() === req.user.id
		);
		userToUnfollow.followers.splice(userToUnfollowIndex, 1);

		const userIndex = user.following.findIndex(
			(e) => e.user.toString() === req.params.userId
		);
		user.following.splice(userIndex, 1);
		await userToUnfollow.save();
		await user.save();
		res.json({
			data: {
				following: user.following,
			},
		});
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
};

// Block a user
exports.block = async (req, res, next) => {
	try {
		const userToBlock = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!userToBlock) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		// make sure they can't block themselves
		if (req.user.id === req.params.userId) {
			return res.status(400).json({
				errors: [
					{
						msg: "Not alowed",
						status: "400",
					},
				],
			});
		}

		// check if the user has already been blocked
		if (
			user.blocked.filter((e) => e.toString() === req.params.userId).length ===
			1
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "This user has already been blocked",
						status: "401",
					},
				],
			});
		}

		user.blocked.unshift(req.params.userId);
		userToBlock.blockedMe.unshift(req.user.id);
		user.save();
		userToBlock.save();
		res.json({
			data: {
				blocked: user.blocked,
			},
		});
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
};

// Unblock a user
exports.unblock = async (req, res, next) => {
	try {
		const userToUnblock = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!userToUnblock) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		// make sure they can't unblock themselves
		if (req.user.id === req.params.userId) {
			return res.status(400).json({
				errors: [
					{
						msg: "You can't unblock yourself",
						status: "400",
					},
				],
			});
		}

		// check if they're trying to unblock who they haven't blocked
		if (
			user.blocked.filter((e) => e.toString() === req.params.userId).length ===
			0
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "You've not blocked this user",
						status: "40",
					},
				],
			});
		}

		const blockedIndex = user.blocked.findIndex(
			(e) => e.toString() === req.params.userId
		);
		const blockedMeIndex = userToUnblock.blockedMe.findIndex(
			(e) => e.toString() === req.user.id
		);
		user.blocked.splice(blockedIndex, 1);
		userToUnblock.blockedMe.splice(blockedMeIndex, 1);
		user.save();
		userToUnblock.save();
		res.json({
			data: {
				blocked: user.blocked,
			},
		});
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
};

// Mute a user
exports.mute = async (req, res, next) => {
	try {
		const userToMute = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);

		if (!userToMute) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		// make sure they can't mute themselves
		if (req.user.id === req.params.userId) {
			return res.status(400).json({
				errors: [
					{
						msg: "You can't mute yourself",
						status: "400",
					},
				],
			});
		}

		// check if they've already been muted
		if (
			user.muted.filter((e) => e.toString() === req.params.userId).length === 1
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "This user hasn't been muted",
						status: "400",
					},
				],
			});
		}

		user.muted.unshift(req.params.userId);
		user.save();
		res.json({ data: { muted: user.muted } });
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [{ msg: "User not found", status: "404" }],
			});
		}
		next(err);
	}
};

// Unmute a user
exports.unmute = async (req, res, next) => {
	try {
		const userToUnmute = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);

		if (!userToUnmute) {
			return res.status(404).json({
				errors: [{ msg: "User not found", status: "404" }],
			});
		}

		// make sure they can't unmute themselves
		if (req.user.id === req.params.userId) {
			return res.status(400).json({
				errors: [
					{
						msg: "You can't unmute yourself",
						status: "400",
					},
				],
			});
		}

		// check if they're trying to unmute who they haven't muted
		if (
			user.muted.filter((e) => e.toString() === req.params.userId).length === 0
		) {
			return res.status(400).json({
				errors: [{ msg: "This user hasn't been muted" }],
			});
		}

		const mutedIndex = user.muted.findIndex(
			(e) => e.toString() === req.params.userId
		);
		user.muted.splice(mutedIndex, 1);
		user.save();
		res.json({ data: { muted: user.muted } });
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res
				.status(404)
				.json({ errors: [{ msg: "User not found", status: "404" }] });
		}
		next(err);
	}
};

// Turn on post notifications for a user
exports.notificationsOn = async (req, res, next) => {
	try {
		const following = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);

		if (!following) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		// verify that user isn't turning on notifications for themselves.
		if (req.user.id === req.params.userId) {
			return res.status(400).json({
				errors: [
					{
						msg: "Can't turn on notifications for yourself",
						status: "400",
					},
				],
			});
		}

		// verify that user is following who they wanna turn on notifs for
		if (
			user.following.filter((e) => e.user.toString() === req.params.userId)
				.length === 0
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "Must follow user before turning on notifications",
						status: "400",
					},
				],
			});
		} else {
			user.following.forEach((e) => {
				if (e.user.toString() === req.params.userId) {
					e.notificationsOn = true;
				}
			});

			await user.save();
			res.json({
				data: {
					notificationsOnFor: user.following.filter(
						(e) => e.notificationsOn === true
					),
				},
			});
		}
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
};

// Turn off post notifications for a user
exports.notificationsOff = async (req, res, next) => {
	try {
		const following = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);

		if (!following) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		// verify that user isn't turning off notifications for themselves.
		if (req.user.id === req.params.userId) {
			return res.status(400).json({
				errors: [
					{
						msg: "Can't turn off notifications for yourself",
						status: "400",
					},
				],
			});
		}

		if (
			user.following.filter((e) => e.user.toString() === req.params.userId)
				.length === 0
		) {
			return res.status(400).json({
				errors: [
					{
						msg: "Must be following user before turning off notifications",
						status: "400",
					},
				],
			});
		}

		user.following.forEach((e) => {
			if (e.user.toString() === req.params.userId) {
				e.notificationsOn = false;
			}
		});

		await user.save();
		res.json({
			data: {
				notificationsOnFor: user.following.filter(
					(e) => e.user.notificationsOn === true
				),
			},
		});
	} catch (err) {
		if (err.kind === "ObjectId") {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}
		next(err);
	}
};

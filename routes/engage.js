const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticator = require("../middleware/authenticator");

/*
there will be 
- follow users, unfollow
- block user(. once you block, once you block you unfollow but not the otherway round), unblock
- mute user, unmute
- turn on post notifications(you must be following and not blocked), turn off
 */

// follow
router.put("/follow/:userId", authenticator, async (req, res, next) => {
	try {
		const userToFollow = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).json({
				errors: [
					{
						msg: "Not authorized",
						status: "401",
					},
				],
			});
		}
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
						msg: "Not allowed",
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
						msg: "Not allowed",
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
});

// unfollow
router.put("/unfollow/:userId", authenticator, async (req, res, next) => {
	try {
		const userToUnfollow = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).json({
				errors: [
					{
						msg: "Not authorized",
						status: "401",
					},
				],
			});
		}
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
						msg: "Not allowed",
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
						msg: "Not allowed",
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
});

// block a user
router.put("/block/:userId", authenticator, async (req, res, next) => {
	try {
		const userToBlock = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).json({
				errors: [
					{
						msg: "Not authorized",
						status: "401",
					},
				],
			});
		}
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
						msg: "Not allowed",
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
});

// unblock a user
router.put("/unblock/:userId", authenticator, async (req, res, next) => {
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
						msg: "Not allowed",
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
						msg: "Not allowed",
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
});

// mute a user
router.put("/mute/:userId", authenticator, async (req, res, next) => {
	try {
		const userToMute = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).json({
				errors: [
					{
						msg: "Not authorized",
						status: "401",
					},
				],
			});
		}
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
						msg: "Not allowed",
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
						msg: "Not allowed",
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
});

// unmute a user
router.put("/unmute/:userId", authenticator, async (req, res, next) => {
	try {
		const userToUnmute = await User.findById(req.params.userId);
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).json({
				errors: [{ msg: "Not authorized", status: "401" }],
			});
		}
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
						msg: "Not allowed",
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
				errors: [{ msg: "Not allowed" }],
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
});

// turn on notifications for a user
router.put(
	"/notificationsOn/:userId",
	authenticator,
	async (req, res, next) => {
		try {
			const following = await User.findById(req.params.userId);
			const user = await User.findById(req.user.id);

			if (!user) {
				return res.status(401).json({
					errors: [
						{
							msg: "Not authorized",
							status: "401",
						},
					],
				});
			}
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
							msg: "Not allowed",
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
					errors: [{ msg: "Not allowed", status: "400" }],
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
							(e) => e.user.notificationsOn === true
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
	}
);

// turn off notifications
router.put(
	"/notificationsOff/:userId",
	authenticator,
	async (req, res, next) => {
		try {
			const following = await User.findById(req.params.userId);
			const user = await User.findById(req.user.id);

			if (!user) {
				return res.status(401).json({
					errors: [
						{
							msg: "Not authorized",
							status: "401",
						},
					],
				});
			}
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
							msg: "Not allowed",
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
					errors: [{ msg: "Not allowed", status: "400" }],
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
	}
);

module.exports = router;

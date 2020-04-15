const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const {
	follow,
	unfollow,
	block,
	unblock,
	mute,
	unmute,
	notificationsOn,
	notificationsOff
} = require("../controllers/engage");

/*
 * @desc Follow a User
 * @method PUT
 * @api private
*/
router.put("/follow/:userId", authenticator, follow);

/*
 * @desc Unfollow a user
 * @method PUT
 * @api private
*/
router.put("/unfollow/:userId", authenticator, unfollow);

/*
 * @desc Block a user
 * @method PUT
 * @api private
*/
router.put("/block/:userId", authenticator, block);

/*
 * @desc Unblock a user
 * @method PUT
 * @api private
*/
router.put("/unblock/:userId", authenticator, unblock);

/*
 * @desc Mute a user
 * @method PUT
 * @api private
*/
router.put("/mute/:userId", authenticator, mute);

/*
 * @desc Unmute a user
 * @method PUT
 * @api private
*/
router.put("/unmute/:userId", authenticator, unmute);

/*
 * @desc Turn on Post Notifications for a user
 * @method PUT
 * @api private
*/
router.put(
	"/notifications-on/:userId",
	authenticator, notificationsOn
);

/*
 * @desc Turn off Post Notifications for a user
 * @method PUT
 * @api private
*/
router.put(
	"/notifications-off/:userId",
	authenticator, notificationsOff
);

module.exports = router;

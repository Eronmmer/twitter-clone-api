const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authenticator = require("../middleware/authenticator");
const { register, allTweets, allLikes } = require("../controllers/users");

/*
 * @desc Registers a user
 * @method POST
 * @api public
 */

router.post("/", [
	check("name", "Field shouldn't be empty").not().isEmpty(),
	check("email", "Please input a valid email address")
		.isEmail()
		.normalizeEmail(),
	check(
		"username",
		"Your username must be at least 4 characters long"
	).isLength({ min: 4 }),
	check(
		"password",
		"Your password must be at least 8 characters long"
	).isLength({ min: 8 }),
	register,
]);

/*
 * @desc Get all tweets by a user including retweets.
 * To get all of the users comments or replies too, add
 * an include query with a value of replies. `/allTweets?include=replies`
 * @method GET
 * @api private
 */
router.get("/allTweets", authenticator, allTweets);

/*
 * @desc Get all likes by a user
 * @method GET
 * @api Private
 */
router.get("/allLikes", authenticator, allLikes);

module.exports = router;

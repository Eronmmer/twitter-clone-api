const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const { check } = require("express-validator");
const {
	getTweet,
	createTweet,
	quoteTweet,
	editTweet,
	likeTweet,
	unlikeTweet,
	commentOnTweet,
	retweet,
	undoRetweet,
	deleteTweet,
} = require("../controllers/posts");

/*
 * @desc Get a Tweet by it's ID
 * @method GET
 * @api public
 */
router.get("/:tweetId", getTweet);

/*
 * @desc Create a Tweet
 * @method POST
 * @api private
 */
router.post(
	"/",
	[
		check("postContent", "Please add something to your post").not().isEmpty(),
		authenticator,
	],
	createTweet
);

/*
 * @desc Quote a Tweet
 * @method POST
 * @api private
 */
router.post(
	"/quote/:tweetId",
	[check("postContent", "Please add something to your post"), authenticator],
	quoteTweet
);

/*
 * @desc Edit a Tweet
 * @method PUT
 * @api private
 */
router.put(
	"/content/:tweetId",
	[
		check("postContent", "Please add a post content").not().isEmpty(),
		authenticator,
	],
	editTweet
);

/*
 * @desc Like a Tweet
 * @method PUT
 * @api private
 */
router.put("/like/:tweetId", authenticator, likeTweet);

/*
 * @desc Unlike a Tweet
 * @method PUT
 * @api private
 */
router.put("/unlike/:tweetId", authenticator, unlikeTweet);

/*
 * @desc Comment on a Tweet or Comment
 * @method POST
 * @api private
 */
router.post(
	"/comment/:tweetId",
	[
		check("postContent", "Please add something to your post").not().isEmpty(),
		authenticator,
	],
	commentOnTweet
);

/*
 * @desc Retweet a Tweet
 * @method PUT
 * @api private
 */
router.put("/retweet/:tweetId", authenticator, retweet);

/*
 * @desc Undo Retweet
 * @method PUT
 * @api private
 */
router.put("/unretweet/:tweetId", authenticator, undoRetweet);

/*
 * @desc Delete a Tweet
 * @method DELETE
 * @api private
 */
router.delete("/delete/:tweetId", authenticator, deleteTweet);

module.exports = router;

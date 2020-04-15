const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authenticator = require("../middleware/authenticator");
const {
	login,
	register,
	getUser,
	resetPassword,
	forgotPassword,
} = require("../controllers/auth");

/*
 * @desc Gets logged in user
 * @method GET
 * @api private
 */
router.get("/user", authenticator, getUser);

/*
 * @desc Logs in a user
 * @method POST
 * @api public
 */
router.post(
	"/login",
	[
		check("email", "All fields are required").not().isEmpty(),
		check("password", "All fields are required").not().isEmpty(),
	],
	login
);

/*
 * @desc Registers a user
 * @method POST
 * @api public
 */

router.post(
	"/register",
	[
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
	],
	register
);

/*
 * @desc sends token to email if user wants to reset their password
 * @method POST
 * @api public
 */
router.post(
	"/forgot-password",
	check("email", "Email field is required").not().isEmpty(),
	forgotPassword
);

/*
 * @desc Resets password
 * @method POST
 * @api public
 */
router.post(
	"/reset-password/",
	[
		check(
			"password",
			"Your password must be at least 8 characters long"
		).isLength({ min: 8 }),
		check("token", "Token field is required").not().isEmpty(),
	],
	resetPassword
);

module.exports = router;

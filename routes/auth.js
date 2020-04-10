const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authenticator = require("../middleware/authenticator");
const { login, register, getUser } = require("../controllers/auth");

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
router.post("/login", login);


/*
 * @desc Registers a user
 * @method POST
 * @api public
 */

router.post("/register", [
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

module.exports = router;

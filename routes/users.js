const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { register } = require("../controllers/users");

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

module.exports = router;

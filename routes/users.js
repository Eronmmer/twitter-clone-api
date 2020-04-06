const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// create user accounts
router.post(
	"/",
	[
		check("name", "Field shouldn't be empty")
			.not()
			.isEmpty(),
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
		).isLength({ min: 8 })
	],
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const { name, email, username, password } = req.body;
		try {
			const checkEmail = await User.findOne({ email });
			const checkUsername = await User.findOne({ username });

			if (checkEmail) {
				return res.status(400).send("user with this email already exists");
			}
			if (checkUsername) {
				return res.status(400).send("Username not available");
			}

			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(password, salt);

			const user = new User({
				name,
				email,
				username,
				password: hashedPassword
			});

			await user.save();
			res.status(200).send("Account successfully created");
		} catch (err) {
			next(err);
		}
	}
);

module.exports = router;

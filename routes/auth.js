const express = require("express");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

// get verified while logged in
router.get("/", authenticator, async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select(["-password"]);
		res.json({ user });
	} catch (err) {
		next(err);
	}
});

// login
router.post(
	"/",
	[
		check("password", "Password must be at least 8 characters long").isLength({
			min: 8
		}),
		check("email", "Please input a valid email").isEmail()
	],
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(400).send("Incorrect email or password!");
			}
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).send("Incorrect email or password!");
			}
			// create token and return
			const payload = {
				user: {
					id: user.id
				}
			};
			jwt.sign(payload, secret, { expiresIn: "2 days" }, (err, token) => {
				if (err) throw err;
				res.send(token);
			});
		} catch (err) {
			next(err);
		}
	}
);

module.exports = router;

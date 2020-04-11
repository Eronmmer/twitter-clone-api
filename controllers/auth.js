const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { reservedUsernames } = require("../utils");

// Register a user
exports.register = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	const { name, email, username, password } = req.body;
	try {
		const checkEmail = await User.findOne({ email });
		const checkUsername = await User.findOne({ username });

		if (checkEmail) {
			return res.status(400).json({
				errors: [
					{
						msg: "Email has already been taken",
						status: "400",
					},
				],
			});
		}
		if (checkUsername) {
			return res.status(400).json({
				errors: [
					{
						msg: "Username has already taken",
						status: "400",
					},
				],
			});
		}

		if (reservedUsernames.includes(username.toLowerCase())) {
			return res.status(400).json({
				errors: [
					{
						msg: "This username is unavailable.",
						status: "400",
					},
				],
			});
		}

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({
			name,
			email,
			username,
			password: hashedPassword,
		});

		await user.save();
		res.status(200).json({
			data: {
				msg: "Account successfully created",
			},
		});
	} catch (err) {
		next(err);
	}
};

// Login user
exports.login = async (req, res, next) => {
	const { email, password } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({
				errors: [
					{
						msg: "Incorrect email or password",
						status: "400",
					},
				],
			});
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				errors: [
					{
						msg: "Incorrect email or password",
						status: "400",
					},
				],
			});
		}
		// create token and return
		const payload = {
			user: {
				id: user.id,
			},
		};
		jwt.sign(payload, secret, { expiresIn: "2 days" }, (err, token) => {
			if (err) throw err;
			res.json({
				data: {
					user: {
						email,
						username: user.username,
					},
					token,
				},
			});
		});
	} catch (err) {
		next(err);
	}
};

// Get logged in user
exports.getUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select(["-password"]);
		const { name, email, username, id } = user;
		res.json({
			data: {
				user: {
					name,
					email,
					username,
					id,
				},
			},
		});
	} catch (err) {
		next(err);
	}
};

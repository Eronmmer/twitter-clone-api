const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.login = async (req, res, next) => {
	const { email, password } = req.body;

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

exports.getUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select(["-password"]);
		const { name, email, username } = user;
		res.json({
			data: {
				user: {
					name,
					email,
					username,
				},
			},
		});
	} catch (err) {
		next(err);
	}
};

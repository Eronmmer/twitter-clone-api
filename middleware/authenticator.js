const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const redUnderline = chalk.red.underline;
const secret = process.env.JWT_SECRET;

const authenticator = (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(401).json({
			errors: [
				{
					msg: "Not authorized",
					status: "401",
				},
			],
		});
	}
	const token = req.headers.authorization.split(" ")[1];
	if (!token) {
		return res.status(401).json({
			errors: [
				{
					msg: "Not authorized",
					status: "401",
				},
			],
		});
	}

	try {
		const decoded = jwt.verify(token, secret);
		req.user = decoded.user;
		next();
	} catch (err) {
		console.error(redUnderline(`${err}`));
		return res.status(401).json({
			errors: [
				{
					msg: "Not authorized",
					status: "401",
				},
			],
		});
	}
};

module.exports = authenticator;

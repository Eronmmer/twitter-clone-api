const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const redUnderline = chalk.red.underline;
const secret = process.env.JWT_SECRET;

const authenticator = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token) {
		return res.status(401).send("Not authorized");
	}

	try {
		const decoded = jwt.verify(token, secret);
		req.user = decoded.user;
	} catch (err) {
		console.error(redUnderline(`${err}`));
		res.status(401).send("Not authorized");
	} finally {
		next();
	}
};

module.exports = authenticator;

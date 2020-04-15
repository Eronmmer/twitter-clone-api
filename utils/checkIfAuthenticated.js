const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const checkIfAuthenticated = (req) => {
	if (!req.headers.authorization) {
		return false;
	}
	const token = req.headers.authorization.split(" ")[1];
	if (!token) {
		return false;
	}
	try {
		const decoded = jwt.verify(token, secret);
		if (!decoded) {
			return false;
		}
		return decoded.user.id;
	} catch (err) {
		console.log(err);
		return false;
	}
};

module.exports = checkIfAuthenticated;

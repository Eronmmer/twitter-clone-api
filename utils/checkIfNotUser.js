const checkIfNotUser = (user, res, type = "private") => {
	if (!user && type === "public") {
		return res.status(404).json({
			errors: [
				{
					msg: "User not found",
					status: "404",
				},
			],
		});
	} else {
		return res.status(401).json({
			errors: [
				{
					msg: "Forbidden",
					status: "403",
				},
			],
		});
	}
};

module.exports = checkIfNotUser;

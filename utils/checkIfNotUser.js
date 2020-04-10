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
	} else if(!user && type === "private") {
		return res.status(403).json({
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

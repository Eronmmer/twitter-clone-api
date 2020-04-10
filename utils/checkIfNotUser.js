const checkIfNotUser = (user, res) => {
	if (!user) {
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

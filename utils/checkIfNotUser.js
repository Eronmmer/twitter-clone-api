const checkIfNotUser = (user, res) => {
	if (!user) {
		return res.status(401).json({
			errors: [
				{
					msg: "Not allowed",
					status: "401",
				},
			],
		});
	}
};

module.exports = checkIfNotUser;

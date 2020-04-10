
const checkIfBlocked = (res, reqUser, secondUser) => {
	if (secondUser.blocked.includes(reqUser.id)) {
		return res.status(403).json({
			errors: [
				{
					msg: "You're blocked from viewing this user's tweets",
					status: "403",
				},
			],
		});
	}
};

module.exports = checkIfBlocked;

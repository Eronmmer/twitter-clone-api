const checkIfAuthenticated = async (req) => {
	if (req.user) {
		if (req.user.id) {
			return true;
		} else return false;
	} else return false;
};

module.exports = checkIfAuthenticated;

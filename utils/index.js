const connectDB = require("./connectDB");
const applyRoutes = require("./applyRoutes");
const applyMiddleware = require("./applyMiddleware");
const checkIfNotUser = require("./checkIfNotUser");
const objectIdError = require("./objectIdError");
const checkIfAuthenticated = require("./checkIfAuthenticated");
const checkIfBlocked = require("./checkIfBlocked");
const reservedUsernames = require("./reservedUsernames");

module.exports = {
	applyRoutes,
	applyMiddleware,
	connectDB,
	checkIfNotUser,
	objectIdError,
	checkIfAuthenticated,
	checkIfBlocked,
	reservedUsernames
};

const connectDB = require("./connectDB");
const applyRoutes = require("./applyRoutes");
const applyMiddleware = require("./applyMiddleware");
const checkIfNotUser = require("./checkIfNotUser");
const objectIdError = require("./objectIdError");
const checkIfAuthenticated = require("./checkIfAuthenticated");
const checkIfBlocked = require("./checkIfBlocked");
const reservedUsernames = require("./reservedUsernames");
const welcomeEmail = require("./welcomeEmail");
const sendResetEmail = require("./sendResetEmail");

module.exports = {
	applyRoutes,
	applyMiddleware,
	connectDB,
	checkIfNotUser,
	objectIdError,
	checkIfAuthenticated,
	checkIfBlocked,
	reservedUsernames,
	welcomeEmail,
	sendResetEmail,
};

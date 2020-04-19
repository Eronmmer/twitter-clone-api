const connectDB = require("./connectDB");
const applyRoutes = require("./applyRoutes");
const applyMiddleware = require("./applyMiddleware");
const objectIdError = require("./objectIdError");
const checkIfAuthenticated = require("./checkIfAuthenticated");
const reservedUsernames = require("./reservedUsernames");
const welcomeEmail = require("./welcomeEmail");
const sendResetEmail = require("./sendResetEmail");
const dropAllCollections = require("./dropAllCollections");

module.exports = {
	applyRoutes,
	applyMiddleware,
	connectDB,
	objectIdError,
	checkIfAuthenticated,
	reservedUsernames,
	welcomeEmail,
	sendResetEmail,
	dropAllCollections
};

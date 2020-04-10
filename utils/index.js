const connectDB = require("./connectDB");
const applyRoutes = require("./applyRoutes");
const applyMiddleware = require("./applyMiddleware");
const checkIfNotUser = require("./checkIfNotUser");
const objectIdError = require("./objectIdError");

module.exports = {
	applyRoutes,
	applyMiddleware,
	connectDB,
	checkIfNotUser,
	objectIdError
};

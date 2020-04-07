const connectDB = require("./connectDB");
const applyRoutes = require("./applyRoutes");
const applyMiddleware = require("./applyMiddleware");
const checkIfNotUser = require("./checkIfNotUser");

module.exports = {
	applyRoutes,
	applyMiddleware,
	connectDB,
	checkIfNotUser
};

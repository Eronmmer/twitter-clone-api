const connectDB = require("./connectDB");
const applyRoutes = require("./applyRoutes");
const applyMiddleware = require("./applyMiddleware");

module.exports = {
	applyRoutes,
	applyMiddleware,
	connectDB
};

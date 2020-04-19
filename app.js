require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes");
const middleware = require("./middleware");
const errorHandlers = require("./middleware/errorHandlers");
const { applyRoutes, applyMiddleware, connectDB } = require("./utils");

connectDB();

applyMiddleware(middleware, app);

app.get("/", (req, res) => {
	res.send("API up and running");
});

applyRoutes(routes, app);

applyMiddleware(errorHandlers, app);

module.exports = app;

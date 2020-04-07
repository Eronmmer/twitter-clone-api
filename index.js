require("dotenv").config();
const express = require("express");
const chalk = require("chalk");
const app = express();
const PORT = process.env.PORT || 6500;
const HOST = process.env.HOST || "localhost";
const routes = require("./routes");
const middleware = require("./middleware");
const errorHandlers = require("./middleware/errorHandlers");
const { applyRoutes, applyMiddleware, connectDB } = require("./utils");
const magentaUnderline = chalk.magenta.underline;

connectDB();

applyMiddleware(middleware, app);

app.get("/", (req, res) => {
	res.send("API up and running");
});

applyRoutes(routes, app);

applyMiddleware(errorHandlers, app);

app.listen(PORT, HOST, () => {
	console.log(magentaUnderline(`Server started on http://${HOST}:${PORT}/`));
});

require("dotenv").config();
const express = require( "express" );
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";
const routes = require("./routes");
const middleware = require("./middleware");
const errorHandlers = require("./middleware/errorHandlers");
const { applyRoutes, applyMiddleware, connectDB } = require("./utils");

// connect database
connectDB();

// load common, basic middleware
applyMiddleware(middleware, app);

app.get("/", (req, res) => {
  res.send("Welcome to Fotia API!");
});

// load routes
applyRoutes(routes, app);

// error handler middleware
applyMiddleware(errorHandlers, app);

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}/`);
});

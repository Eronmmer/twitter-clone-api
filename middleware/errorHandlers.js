const chalk = require("chalk");
const redUnderline = chalk.red.underline;

const handleNotFound = (router) => {
	router.use((req, res, next) => {
		res.status(404).json({
			errors: [
				{
					msg: `Couldn't find the specified route ${req.url}`,
					status: "404",
				},
			],
		});
		next();
	});
};

const handlerServerError = (router) => {
	router.use((err, req, res, next) => {
		res.statusCode = 500;
		console.error(redUnderline(`${err}`));
		res.json({
			errors: [
				{
					msg: "Oops, Something went wrong from our end.",
					status: "500",
				},
			],
		});
		next(err);
	});
};

module.exports = [handleNotFound, handlerServerError];

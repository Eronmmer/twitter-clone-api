const chalk = require("chalk");
const magentaUnderline = chalk.magenta.underline;
const PORT = process.env.PORT || 6500;
const HOST = process.env.HOST || "localhost";
const app = require("./app");

app.listen(PORT, HOST, () => {
	console.log(magentaUnderline(`Server started on http://${HOST}:${PORT}/`));
});

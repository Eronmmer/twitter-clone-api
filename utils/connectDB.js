const mongoose = require("mongoose");
const chalk = require("chalk");
const redUnderline = chalk.red.underline;
const magentaUnderline = chalk.magenta.underline;
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
	try {
		await mongoose.connect(mongoURI, {
			useCreateIndex: true,
			useFindAndModify: false,
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		console.log(magentaUnderline("MongoDB Connected!!"));
	} catch (err) {
		console.error(redUnderline(`${err}`));
		process.exit(1);
	}
};

module.exports = connectDB;

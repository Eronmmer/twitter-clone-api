const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL,
		pass: process.env.GMAIL_PASSWORD,
	},
});

const sendWelcomeEmail = (to, name) =>
	transporter.sendMail(
		{
			from: process.env.GMAIL,
			to,
			subject: "Welcome to Twittr!",
			html: `<p>Hey ${name}, I just wanna welcome you to our beautiful platform. 🙂🙂</p>`,
		},
		function (err, info) {
			if (err) console.log(err);
			else console.log(info);
		}
	);

module.exports = sendWelcomeEmail;

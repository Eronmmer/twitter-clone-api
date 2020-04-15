const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL,
		pass: process.env.GMAIL_PASSWORD,
	},
});

const sendResetEmail = (to, token) =>
	transporter.sendMail(
		{
			from: process.env.GMAIL,
			to,
			subject: "Twittr Password Reset Token!",
			html: `<h2>Here is your password reset token</h2>
                <p><b>${token}</b> <br /> Please note that the token expires in one hour.</p>
          `,
		},
		function (err, info) {
			if (err) console.log(err);
			else console.log(info);
		}
	);

module.exports = sendResetEmail;

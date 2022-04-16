const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.sendMail = async (userEmailAddress, username) => {
	let msg = {
		to: `${userEmailAddress}`,
		from: {
			name: `Be A Programmer`,
			email: `sutharjaydeep20@gmail.com`
		},
		subject: `Welcome to BEAP Family`,
		html: `
			<h1>Welcome ${username} to BEAP Family</h1>
			<a style="background: rgb(15 23 42/1);
  color: white;
  padding: 1em;
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 1px;
  border-radius: 8px;" href="http://localhost:3000/learn">Start Learning</a>
		`
	};


	try {
		await mail.send(msg);
	} catch (err) {
		console.log(`Error Occur ` + err);
	}
	console.log(`Mail is Sent Succesfully`);
};

module.exports.sendResetPasswordLink = async (token, email) => {
	const msg = {
		to: `${email}`,
		from: {
			name: `Be A Programmer`,
			email: `sutharjaydeep20@gmail.com`
		},
		subject: `Reset Password`,
		html: `
			<h1>Reset Password</h1>
			<br>
			<p>reset link will expire in 5 minutes</p>
			<a href="http://localhost:3000/reset/${token}">Reset Password</a>
		`
	};


	try {
		await mail.send(msg);
		console.log(`mail is sent`)
	} catch (err) {
		console.log(`Cannot send Mail :: ` + err);
	}
};

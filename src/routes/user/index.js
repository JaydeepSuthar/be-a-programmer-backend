const router = require('express').Router();
const bcrypt = require('bcrypt');

// * VALIDATION
const { registerUserValidation, loginUserValidation, generateToken } = require('../../helper/validation');
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

// * Prisma
const prisma = require('../../helper/prisma');

// * SendGrid
const { sendMail } = require("../../helper/mail");


// * ADMIN ROUTES
router.get('/all', async (req, res) => {

	// ! return all user :: this is an admin only route
	try {
		const allUsers = await prisma.users.findMany({});
		res.status(200).json({ is_success: true, msg: `All Users`, data: allUsers });
	} catch (err) {
		res.status(401).json({ is_success: false, msg: `Your are not allowed`, error: err });
	}

});


router.get('/all/count', async (req, res) => {

	// ! return all user :: this is an admin only route
	try {
		const totalUserCount = await prisma.users.count({});
		res.status(200).json({ is_success: true, msg: `Total Users Count`, data: totalUserCount });
	} catch (err) {
		res.status(401).json({ is_success: false, msg: `Your are not allowed`, error: err });
	}

});


// * LOGIN ROUTE
router.post('/login', async (req, res) => {

	console.table(req.body);
	const { email, password } = req.body;

	const { error, value } = loginUserValidation({ email, password });
	if (error) return res.status(400).json({ 'error': error.details[0].message });

	// Check email and password is valid
	const user = await prisma.users.findUnique({
		where: {
			email: email
		},

		select: {
			id: true,
			name: true,
			email: true,
			password: true
		}
	});
	if (!user) return res.status(400).json({ is_success: false, msg: `Error Occurred`, error: "No Account Found On This Email Please Create Account First" });

	// check password hash is valid
	const isValidPass = await bcrypt.compare(password, user.password);
	if (!isValidPass) return res.status(400).json({ is_success: false, msg: `Error Occurred`, error: "Email and Password Doesn't match" });

	delete user.password;

	// const token = jwt.sign
	// ! solve the role error
	const token = generateToken(user.id, "student");
	const auth = {
		token
	};
	const loggedInUser = {
		...user,
		role: 'student'
	};
	// res.header("authorization", token);
	res.status(200).json({ is_success: true, msg: `Successfully logged in`, data: loggedInUser, auth });
	// res.end();
});

// * SIGNUP ROUTE / ADD USER
router.post('/signup', async (req, res) => {

	const { name, email, contact, password, qual } = req.body;

	// * check data is valid
	const { error, value } = registerUserValidation({ name, email, contact, password });
	if (error) return res.status(400).json({ 'error': error.details[0].message });

	// check user email already exists
	const userExists = await prisma.users.findUnique({
		where: {
			email: email
		}
	});
	if (userExists) return res.status(400).json({ is_success: false, msg: `Error Occurred`, error: "Email is already register" });

	const hashedPassword = await bcrypt.hash(password, 10);

	// * saving it in db
	const user = {
		name: name,
		email: email,
		contact: contact,
		password: hashedPassword,
		qualification: `higher_secondary`
	};


	try {
		const newUser = await prisma.users.create({ data: user });
		await sendMail(newUser.email, newUser.name);

		res.status(201).json({
			is_success: true,
			msg: "New User Created",
			data: newUser
		});


	} catch (err) {
		console.log(err.message);
		res.status(400).json({ is_success: false, msg: `Error Occurred`, error: err });
	}

	res.end();
});

// * EDIT USER
router.patch('/update/:user_id', async (req, res) => {

	const id = req.params.user_id;
	const { name, contact, password } = req.body;

	// Check email and password is valid
	const user = await prisma.users.findUnique({
		where: {
			id: id
		}
	});
	if (!user) return res.status(400).json({ is_success: false, msg: `Error Occurred`, error: "No Account Found On This Email Please Create Account First" });

	const hashedPassword = await bcrypt.hash(password, 10);

	// * saving it in db
	const userData = {
		name: name,
		contact: contact,
		password: hashedPassword,
		qualification: 'higher_secondary'
	};

	try {
		const updatedUser = await prisma.users.update({
			where: { id: id },
			data: userData
		});
		res.json(updatedUser);
	} catch (err) {
		console.log(err.message);
		res.status(400).json({ is_success: false, msg: `Error Occurred`, error: err });
		throw err;
	}

	res.end();
});

// * DELETE USER
router.delete('/delete/:user_id', async (req, res) => {

	const id = req.params.user_id;

	// Check email and password is valid
	const user = await prisma.users.findUnique({
		where: {
			id: id
		}
	});
	if (!user) return res.status(400).json({ is_success: false, msg: `Error Occurred`, error: "No Account Found On This Email Please Create Account First" });

	try {
		const deleteUser = await prisma.users.delete({
			where: {
				id: id
			}
		});
		res.json({
			msg: `User Succesfully Deleted`
		});
	} catch (err) {
		res.status(400).json(`Error Occur ${err}`);
		// throw err;
	}

	res.end();
});


// * ALL INSTRUCTOR ROUTES HERE
router.post('/admin/login', async (req, res) => {

	const { email, password } = req.body;

	try {
		const loggedInAdminUser = await prisma.admin.findFirst({
			where: {
				email: email,
				AND: {
					password: password
				}
			}
		});

		const token = generateToken(loggedInAdminUser.id, loggedInAdminUser.role);
		res.status(200).json({ is_success: true, msg: `logged in success as admin user`, data: { auth_token: token } });
	} catch (err) {
		console.error(err);
		res.status(404).json({ is_success: false, msg: `Invalid Credential`, error: err.message });
	}
	res.end();
});


// * DELETE ADMIN USER
router.delete('/admin/delete/:user_id', async (req, res) => {

	const id = req.params.user_id;

	// Check email and password is valid
	const user = await prisma.admin.findUnique({
		where: {
			id: id
		}
	});
	if (!user) return res.status(400).json({ is_success: false, msg: `Error Occurred`, error: "No Account Found On This Email Please Create Account First" });

	try {
		const deleteUser = await prisma.admin.delete({
			where: {
				id: id
			}
		});
		res.json({ msg: `User Succesfully Deleted` });
	} catch (err) {
		console.log(err);
		res.status(400).json(`Error Occur ${err}`);
	}

	res.end();
});


module.exports = router;

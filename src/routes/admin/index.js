const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin, verifyAdmin } = require('../../middlewares/auth');
const { generateToken } = require('../../helper/validation');

// * Prisma
const prisma = require('../../helper/prisma');

/**
 * @desc Admin Logged In
 */
router.post('/login', async (req, res) => {
	const { email, password } = req.body || undefined;

	console.log(email, password);

	// TODO: CREATE LOGIN METHOD FOR ADMIN
	try {

		const loggedInUser = await prisma.admin.findUnique({
			where: {
				email: email
			},
			rejectOnNotFound: true
		});

		if (!(loggedInUser.password === password)) throw Error(`Password Doesn't Match`);

		// console.log(`LOGGED IN USER ${JSON.stringify(loggedInUser)}`);

		if (loggedInUser) {
			delete loggedInUser.password;
			req.session.user = loggedInUser;

			const token = generateToken(loggedInUser.id, loggedInUser.role);

			return res.status(200).json({ is_success: true, msg: 'Admin Logged In Success', data: loggedInUser, token: token });
		}

	} catch (err) {
		console.error(err);
		return res.status(409).json({ is_success: true, msg: 'Invalid Credentials', error: err });
	}
});


router.get('/secret', verifyAdmin, (req, res) => {
	return res.status(200).json({ is_success: true, msg: 'Admin Secret' });
});
router.get('/', (req, res) => {
	return res.status(200).json({ is_success: true, msg: 'Admin routes' });
});

router.delete('/logout', isAdmin, (req, res) => {
	req.session.destroy();
	res.status(200).json({ is_success: true, msg: `You are succesfully logged out` });
})

module.exports = router;

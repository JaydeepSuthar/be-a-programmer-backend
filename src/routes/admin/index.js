const router = require('express').Router()

// * VALIDATION
const { isLoggedIn, isAdmin, verifyAdmin } = require('../../middlewares/auth')
const { generateToken } = require('../../helper/validation')

// * Prisma
const prisma = require('../../helper/prisma')

router.get('/all', isLoggedIn, isAdmin, async (req, res) => {
	try {
		const allAdmin = await prisma.admin.findMany({
			where: {
				role: {
					not: {
						equals: 'admin'
					}
				}
			}
		})
		res.status(200).json({ is_success: true, msg: `All Users`, data: allAdmin })
	} catch (err) {
		res.status(401).json(`Error Occur`)
	}
})


/**
 * @desc Admin Logged In
 */
router.post('/login', async (req, res) => {

	const { email, password } = req.body || undefined

	console.log(email, password)

	try {

		const loggedInUser = await prisma.admin.findUnique({
			where: {
				email: email
			},
			rejectOnNotFound: true
		})

		if (!(loggedInUser.password === password)) throw Error(`Password Doesn't Match`)

		// console.log(`LOGGED IN USER ${JSON.stringify(loggedInUser)}`);

		if (loggedInUser) {
			delete loggedInUser.password
			req.session.user = loggedInUser

			const token = generateToken(loggedInUser.id, loggedInUser.role)

			return res.status(200).json({ is_success: true, msg: 'Admin Logged In Success', data: loggedInUser, token: token })
		}

	} catch (err) {
		console.error(err)
		return res.status(409).json({ is_success: true, msg: 'Invalid Credentials', error: err })
	}
})


/**
 * @desc
 */
router.post('/add', async (req, res) => {
	const { name, email, password, role } = req.body || null

	try {
		const newAdminUser = await prisma.admin.create({
			data: {
				name: name,
				email: email,
				password: password,
				role: role
			}
		})

		return res.status(200).json({ is_success: true, msg: `New ${newAdminUser.role.toUpperCase()} user created`, data: newAdminUser })
	} catch (err) {
		console.error(err)
		return res.status(400).json({ is_success: false, msg: 'Error in creating user', error: err })
	}
})

router.get('/secret', verifyAdmin, (req, res) => {
	return res.status(200).json({ is_success: true, msg: 'Admin Secret' })
})
router.get('/', (req, res) => {
	return res.status(200).json({ is_success: true, msg: 'Admin routes' })
})

router.delete('/logout', (req, res) => {
	req.session.destroy()
	res.status(200).json({ is_success: true, msg: `You are succesfully logged out` })
})

module.exports = router

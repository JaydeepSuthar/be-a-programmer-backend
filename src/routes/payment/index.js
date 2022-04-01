const router = require("express").Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

// * Prisma
const prisma = require("../../helper/prisma");

// * Razorpay
const { generateOrders } = require('../../helper/payment');

// * SendGrid
const { sendMail } = require("../../helper/mail");

/**
 * @desc Create Payment
 */

router.post('/create', async (req, res) => {
	const course_id = req.body.course_id;

	const course = await prisma.course_details.findUnique({
		where: {
			id: course_id
		}
	});
	const coursePrice = course.price;

	try {
		const orderData = await generateOrders(coursePrice);
		return res.status(200).json({ is_success: true, msg: `Order Generated`, data: orderData });
	} catch (err) {
		return res.status(200).json({ is_success: true, msg: `Error While Generating Order` + err });
	}
});

/**
 * @desc Send Welcome Mail
 */
router.get('/mail', async (req, res) => {

	const response = await sendMail();

	return res.status(200).json({ is_success: true, msg: response });
});

module.exports = router;

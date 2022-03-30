const router = require("express").Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

// * Prisma
const prisma = require("../../helper/prisma");

// * Razorpay
const { generateOrder } = require('../../helper/payment');

// * Mail
const { sendMail } = require('../../helper/auth_mail');

/**
 * @desc Payment Route
 */
// TODO: add payment route
router.post('/create', async (req, res) => {
	// console.log(req.body);

	const course = await prisma.course_details.findUnique({
		where: {
			id: req.body.course_id
		}
	});
	// console.log(course.price);

	const coursePrice = course.price;
	const order = await generateOrder(coursePrice);

	console.log(order);

	return res.status(200).json({ is_success: true, msg: `Order Generated`, data: order });
});

/**
 * @desc Auth Mail
 */
router.get('/mail', async (req, res) => {
	const response = await sendMail();
	return res.status(200).json({ is_success: true, msg: response });
});

module.exports = router;

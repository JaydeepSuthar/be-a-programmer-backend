const router = require("express").Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

// * Prisma
const prisma = require("../../helper/prisma");

// * Razorpay
// const { generateOrder } = require('../../helper/payment');

const Razorpay = require('razorpay');
const { nanoid } = require('nanoid');


const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});


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
	// const order = await generateOrder(coursePrice);
	const order = await razorpay.orders.create({
		amount: coursePrice * 100,
		receipt: `Receipt: ${nanoid()}`,
		payment_capture: 1
	});

	console.log(order);

	const orderData = {
		id: order.id,
		amount: order.amount,
		receipt: order.receipt,
	};

	return res.status(200).json({ is_success: true, msg: `Order Generated`, data: orderData });
});

module.exports = router;

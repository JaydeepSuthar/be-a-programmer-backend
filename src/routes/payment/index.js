const router = require("express").Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require("../../middlewares/auth");

// * Prisma
const prisma = require("../../helper/prisma");

// * Razorpay
const { generateOrders, capturePayments } = require('../../helper/payment');

// * SendGrid
const { sendMail } = require("../../helper/mail");

/**
 * @desc Create Payment
 */

router.post('/create', async (req, res) => {

	const discount = req.body.discount;

	if (!req.session.user) {
		return res.status(200).json({ is_success: false, msg: `Please Logged In First` });
	}

	const allItemsInCart = await prisma.cart.findMany({
		where: {
			usersId: req.session.user.id
		},
		include: {
			Course_details: {
				select: {
					price: true
				}
			}
		}
	});

	let coursePrice = 0;
	allItemsInCart.map(item => coursePrice += item.Course_details.price);

	try {
		const orderData = await generateOrders(coursePrice - discount);
		return res.status(200).json({ is_success: true, msg: `Order Generated`, data: orderData });
	} catch (err) {
		return res.status(200).json({ is_success: true, msg: `Error While Generating Order` + err });
	}
});

/**
 * @desc Verify Payment
 */
router.post('/success', async (req, res) => {

	const { payment_id, orderDetails } = req.body;

	console.table(req.body);

	if (!req.session.user) {
		return res.status(200).json({ is_success: false, msg: `Please Logged In First` });
	}

	const captureResponse = await capturePayments(payment_id, orderDetails.amount);
	// console.table(captureResponse);

	// res.end();
	const saveTransaction = await prisma.transactions.create({
		data: {
			order_no: orderDetails.id,
			razorpay_payment_id: payment_id,
			status: captureResponse.status,
			usersId: req.session.user.id
		}
	});

	const allItemsInCart = await prisma.cart.findMany({
		where: {
			usersId: req.session.user.id
		},
		// include: {
		// 	Course_details: {
		// 		select: {
		// 			id: true
		// 		}
		// 	}
		// }
	});

	let purchasedCourses = [];
	allItemsInCart.map(item => purchasedCourses.push({
		course_id: item.course_detailsId,
		user_id: item.usersId
	}));

	const learning = await prisma.learning.createMany({
		data: purchasedCourses
	});

	console.log(learning);

	const clearCart = await prisma.cart.deleteMany({
		where: {
			usersId: req.session.user.id
		}
	});


	console.log(saveTransaction);
	return res.status(200).json({ is_success: true, msg: `Payment Success`, data: saveTransaction });

});

/**
 * @desc Send Welcome Mail
 */
router.get('/mail', async (req, res) => {

	const response = await sendMail();

	return res.status(200).json({ is_success: true, msg: response });
});

module.exports = router;

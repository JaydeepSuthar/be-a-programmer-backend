const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin, verifyUserLogin } = require('../../middlewares/auth');

// * Prisma
const prisma = require('../../helper/prisma');

/**
 * @desc Get all Cart Items
 */
router.get('/', async (req, res) => {

	if (!req.session.user) {
		return res.status(200).json({ is_success: false, msg: `Logged In to Access Cart` });
	}

	try {
		const allItemsInCart = await prisma.cart.findMany({
			where: {
				usersId: req.session.user.id
			},
			include: {
				Course_details: {
					select: {
						id: true,
						title: true,
						price: true,
						thumbnail: true
					}
				}
			}
		});

		return res.status(200).json({ is_success: true, msg: `Item Added to Cart`, data: allItemsInCart });
	} catch (err) {
		return res.status(200).json({ is_success: false, msg: `Your Cart is Empty` });
	}
});

/**
 * @desc Add Item to Cart
 */
router.post('/add', async (req, res) => {
	const course_id = req.body.course_id;

	if (!req.session.user) {
		return res.status(200).json({ is_success: false, msg: `Logged In to Add to Cart` });
	}

	try {
		const oldCartItem = await prisma.cart.findFirst({
			where: {
				AND: [
					{
						usersId: req.session.user.id
					},
					{
						course_detailsId: course_id
					}
				]
			}
		});

		const myLearning = await prisma.learning.findFirst({
			where: {
				AND: [
					{
						user_id: req.session.user.id
					},
					{
						course_id: course_id
					}
				]
			}
		});

		console.log(myLearning);

		if (myLearning) {
			return res.status(200).json({ is_success: false, msg: `You have already purchased this course` });
		}

		if (oldCartItem) {
			return res.status(200).json({ is_success: false, msg: `Item is already in cart` });
		}
	} catch (err) {
		console.log(err);
	}

	try {
		const cartItem = await prisma.cart.create({
			data: {
				course_detailsId: course_id,
				usersId: req.session.user.id
			}
		});

		return res.status(200).json({ is_success: true, msg: `Item Added to Cart`, data: cartItem });
	} catch (err) {
		console.log(err);
		return res.status(400).json({ is_success: false, msg: err });
	}
});

/**
 * @desc Delete item in cart
 */
router.post("/delete", async (req, res) => {
	const cartItemId = req.body.id;
	console.log(req.body);
	// res.end();

	if (!req.session.user) {
		return res.status(200).json({ is_success: false, msg: `Logged In to Add to Cart` });
	}


	try {
		await prisma.cart.deleteMany({
			where: {
				AND: [
					{
						usersId: req.session.user.id
					},
					{
						course_detailsId: cartItemId
					}
				]
			}
		});
		return res.status(200).json({ msg: "Successfully Removed item from cart" });
	} catch (err) {
		console.log(err);
		return res.status(400).json({ msg: "Error While removing item from cart" + err });
	}
});

module.exports = router;

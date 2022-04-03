const router = require('express').Router();

// * VALIDATION
const { isLoggedIn, isAdmin } = require('../../middlewares/auth');

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
						title: true,
						price: true
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

module.exports = router;
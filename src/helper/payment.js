const Razorpay = require('razorpay');
const { nanoid } = require('nanoid');

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET
});

const currency = 'INR';
const payment_capture = 1;

module.exports.generateOrders = async (amount) => {
	const order = await razorpay.orders.create({
		amount: amount * 100, // Money in razorpay is in smallest denomination in inr its paisa to convert into rupee multiply it by 100
		currency,
		receipt: `Receipt ${nanoid()}`,
		payment_capture
	});

	return {
		key: process.env.RAZORPAY_KEY_ID,
		id: order.id,
		amount: order.amount,
		receipt: order.receipt
	};
};

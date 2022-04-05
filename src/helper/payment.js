const Razorpay = require('razorpay');
const { nanoid } = require('nanoid');

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET
});

const currency = 'INR';

module.exports.generateOrders = async (amount) => {
	const order = await razorpay.orders.create({
		amount: amount * 100, // Money in razorpay is in smallest denomination in inr its paisa to convert into rupee multiply it by 100
		currency,
		receipt: `Receipt ${nanoid()}`,
	});

	return {
		key: process.env.RAZORPAY_KEY_ID,
		id: order.id,
		amount: order.amount,
		receipt: order.receipt
	};
};

module.exports.capturePayments = async (paymentId, amount) => {
	const payment = await razorpay.payments.capture(paymentId, amount, 'INR');

	return payment;
}

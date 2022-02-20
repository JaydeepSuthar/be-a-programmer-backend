const Joi = require('joi');
const jwt = require('jsonwebtoken');

module.exports.registerUserValidation = (data) => {
	const registerUserSchema = Joi.object({
		name: Joi.string().min(3).max(20).required(),
		email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io', 'dev'] } }).required(),
		contact: Joi.string().length(10).pattern(/^[0-9]+$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).required(),
		password: Joi.string().min(6).max(16).required(),
	});

	return registerUserSchema.validate(data);
};


module.exports.loginUserValidation = (data) => {
	const loginUserSchema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).max(16).required()
	});

	return loginUserSchema.validate(data);
};


module.exports.generateToken = (userId, role) => {
	return jwt.sign({ userId, role }, process.env.TOKEN_SECRET, { expiresIn: `${process.env.TOKEN_EXPIRY_TIME}m` });
};

module.exports.createCourseValidation = (data) => {
	const createCourseSchema = Joi.object({
		title: Joi.string().min(3).max(50).required(),
		slug: Joi.string().lowercase().min(3).max(24).required(),
		description: Joi.string().min(5).max(200).required(),
		thumbnail: Joi.string(),
		description: Joi.string(),
		requirement: Joi.string(),
		duration: Joi.string(),
		price: Joi.number().required(),
		is_active: Joi.boolean().required(),
		adminId: Joi.string().alphanum().required(),
		tags: Joi.array()
	});

	return createCourseSchema.validate(data);
}

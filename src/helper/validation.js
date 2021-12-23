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

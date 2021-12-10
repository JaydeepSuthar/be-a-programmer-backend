const Joi = require('joi');
const jwt = require('jsonwebtoken');

module.exports.registerUserValidation = (data) => {
    const registerUserSchema = Joi.object({
        name: Joi.string().min(3).max(20).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'io', 'dev'] } }).required(),
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


module.exports.generateToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.TOKEN_SECRET, { expiresIn: 60 });
};

const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

// Validation schemas
const schemas = {
    register: Joi.object({
        username: Joi.string().required().min(3).max(50),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    }),
    
    login: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    }),
    
    task: Joi.object({
        title: Joi.string().required().min(1).max(100),
        description: Joi.string().max(500),
        status: Joi.string().valid('Pending', 'InProgress', 'Completed', 'Cancelled').required()
    }),
    
    refreshToken: Joi.object({
        refreshToken: Joi.string().required()
    })
};

module.exports = {
    validate,
    schemas
}; 
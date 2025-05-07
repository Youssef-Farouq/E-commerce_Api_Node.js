const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

// Password validation pattern
const passwordPattern = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$');

// Validation schemas
const schemas = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            }),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        age: Joi.number().integer().min(13).max(120).required(),
        gender: Joi.string().valid('male', 'female', 'other').required(),
        profilePicUrl: Joi.string().uri().optional()
    }),
    
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    
    refreshToken: Joi.object({
        refreshToken: Joi.string().required()
    }),

    revokeToken: Joi.object({
        refreshToken: Joi.string().required()
    }),

    updateUser: Joi.object({
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(2).max(50),
        age: Joi.number().min(13).max(120),
        gender: Joi.string().valid('male', 'female', 'other'),
        profilePicUrl: Joi.string().uri().allow('')
    }).min(1), // At least one field must be provided

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            })
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        token: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            })
    }),

    createTask: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        status: Joi.string().valid('pending', 'in_progress', 'completed').default('pending')
    })
};

const validateRequest = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({
                success: false,
                message: 'Invalid validation schema'
            });
        }

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        next();
    };
};

module.exports = {
    validate,
    validateRequest,
    schemas
}; 
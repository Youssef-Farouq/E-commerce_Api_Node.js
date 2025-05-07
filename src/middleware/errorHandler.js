const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Don't expose internal errors to client
    const errorResponse = {
        error: {
            message: 'An error occurred while processing your request.',
            code: 'INTERNAL_ERROR'
        }
    };

    // Handle specific error types
    if (err.name === 'ValidationError') {
        errorResponse.error = {
            message: err.message,
            code: 'VALIDATION_ERROR'
        };
        return res.status(400).json(errorResponse);
    }

    if (err.name === 'UnauthorizedError') {
        errorResponse.error = {
            message: 'Invalid authentication credentials',
            code: 'UNAUTHORIZED'
        };
        return res.status(401).json(errorResponse);
    }

    if (err.name === 'ForbiddenError') {
        errorResponse.error = {
            message: 'Insufficient permissions',
            code: 'FORBIDDEN'
        };
        return res.status(403).json(errorResponse);
    }

    // Default to 500 for unhandled errors
    res.status(500).json(errorResponse);
};

module.exports = { errorHandler }; 
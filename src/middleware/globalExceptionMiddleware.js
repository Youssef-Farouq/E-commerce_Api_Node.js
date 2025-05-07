const globalExceptionMiddleware = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    statusCode: 500,
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred while processing your request.',
    detailedMessage: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

module.exports = globalExceptionMiddleware; 
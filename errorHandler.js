const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier.';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists.';
  } else if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? `Uploaded file exceeds the maximum allowed size of ${process.env.MAX_MEDIA_FILE_SIZE_MB || 100} MB.`
      : err.message;
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Request body contains invalid JSON.';
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && statusCode !== 503 ? 'Internal server error.' : message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && statusCode !== 503 && { details: message }),
  });
};

module.exports = { errorHandler };

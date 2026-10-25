const ApiError = require('../utils/ApiError');

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

const csrfProtection = (allowedOrigin) => (req, res, next) => {
  if (safeMethods.has(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  if (origin && origin !== allowedOrigin) {
    return next(new ApiError(403, 'Request origin is not allowed.'));
  }

  return next();
};

module.exports = csrfProtection;

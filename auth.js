const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { getJwtSecret } = require('../utils/token');

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  const token = tokenFromHeader || req.cookies?.token;

  if (!token) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  const secret = getJwtSecret();

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }

  if (!decoded || typeof decoded !== 'object' || !decoded.id) {
    return next(new ApiError(401, 'Invalid or expired token.'));
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return next(new ApiError(401, 'User no longer exists.'));
  }

  req.user = user;
  return next();
});

module.exports = auth;

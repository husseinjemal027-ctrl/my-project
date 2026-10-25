const express = require('express');
const { register, login, logout, getMyProfile } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const ApiError = require('../utils/ApiError');
const { getJwtSecret } = require('../utils/token');

const router = express.Router();

const requireJwtConfiguration = (req, res, next) => {
  try {
    getJwtSecret();
    return next();
  } catch {
    return next(new ApiError(503, 'Authentication is unavailable. Configure a random JWT_SECRET of at least 32 characters in backend/.env.'));
  }
};

const rejectAdminRegistration = (req, res, next) => {
  if (Object.prototype.hasOwnProperty.call(req.body, 'role')) {
    return next(new ApiError(400, 'Role cannot be set during registration.'));
  }
  return next();
};

router.post('/register', authLimiter, requireJwtConfiguration, rejectAdminRegistration, validate(registerValidation), register);
router.post('/login', authLimiter, requireJwtConfiguration, validate(loginValidation), login);
router.post('/logout', requireJwtConfiguration, auth, logout);
router.get('/me', requireJwtConfiguration, auth, getMyProfile);

module.exports = router;

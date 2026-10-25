const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || /^(?:REPLACE_|YOUR_|PASTE_)/i.test(secret) || secret.length < 32) {
    throw new Error('JWT_SECRET must be a random value of at least 32 characters in backend/.env.');
  }
  return secret;
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

module.exports = { generateToken, getJwtSecret };

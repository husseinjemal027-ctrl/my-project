const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return next(new ApiError(503, 'Database is unavailable. Check the MongoDB Atlas connection and try again.'));
  }
  return next();
}

module.exports = requireDatabase;

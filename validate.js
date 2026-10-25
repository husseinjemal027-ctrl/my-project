const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array().map((error) => error.msg).join(', ')));
    }
    return next();
  };
};

module.exports = validate;

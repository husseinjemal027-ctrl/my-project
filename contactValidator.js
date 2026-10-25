const { body } = require('express-validator');

const contactValidation = [
  body('name')
    .isString().withMessage('Name is required.')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.')
    .matches(/^[\p{L}\p{M}\s.'-]+$/u).withMessage('Name contains unsupported characters.'),
  body('email')
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email address is too long.'),
  body('subject')
    .isString().withMessage('Subject is required.')
    .trim()
    .isLength({ min: 3, max: 160 }).withMessage('Subject must be between 3 and 160 characters.')
    .matches(/^[^\u0000-\u001f<>]*$/u).withMessage('Subject contains unsupported characters.'),
  body('message')
    .isString().withMessage('Message is required.')
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters.')
    .matches(/^[^\u0000-\u0008\u000b\u000c\u000e-\u001f]*$/u).withMessage('Message contains unsupported control characters.'),
];

module.exports = contactValidation;

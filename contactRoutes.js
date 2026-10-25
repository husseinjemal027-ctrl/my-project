const express = require('express');
const { submitContactMessage } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const contactValidation = require('../validators/contactValidator');

const router = express.Router();

router.post('/', contactLimiter, validate(contactValidation), submitContactMessage);

module.exports = router;

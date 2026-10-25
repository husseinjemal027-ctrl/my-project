const { body, param, query } = require('express-validator');

const contentCategories = ['quran', 'book', 'audio', 'video', 'dhikr'];
const contentLanguages = ['en', 'am', 'om'];
const updateFields = ['title', 'titles', 'description', 'bodies', 'category', 'image', 'mediaUrl'];

function isValidMediaUrl(value) {
  if (
    /^\/api\/content\/files\/[0-9a-f]{24}$/i.test(value)
    || /^\/uploads\/[0-9a-f-]+\.(?:pdf|epub|mp3|wav|m4a|ogg|mp4|mov|webm)$/i.test(value)
  ) {
    return true;
  }
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function validateTranslations(value, fieldName, maxLength, requireNonEmpty = false) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${fieldName} must be a language object.`);
  }

  for (const [language, text] of Object.entries(value)) {
    if (!contentLanguages.includes(language) || typeof text !== 'string' || text.length > maxLength) {
      throw new Error(`${fieldName} must use en, am, or om and be ${maxLength} characters or fewer.`);
    }
  }

  if (requireNonEmpty && !Object.values(value).some((text) => text.trim())) {
    throw new Error('At least one title must be provided.');
  }

  return true;
}

const contentIdValidation = [
  param('id').isMongoId().withMessage('A valid content ID is required.'),
];

const contentListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100.'),
  query('category').optional().isIn(contentCategories).withMessage('Choose a valid content category.'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search must be 100 characters or fewer.'),
];

const createContentValidation = [
  body('title').optional().isString().withMessage('Title must be text.')
    .bail().trim().isLength({ max: 200 }).withMessage('Title must be 200 characters or fewer.'),
  body('titles').optional().custom((value) => validateTranslations(value, 'Titles', 200)),
  body('description').optional().isString().withMessage('Description must be text.').isLength({ max: 5000 }).withMessage('Description must be 5000 characters or fewer.'),
  body('bodies').optional().custom((value) => validateTranslations(value, 'Descriptions', 5000)),
  body('category').isIn(contentCategories).withMessage('Choose a valid content category.'),
  body('image').optional().isString().withMessage('Image must be a URL or image path.').isLength({ max: 2048 }).withMessage('Image path must be 2048 characters or fewer.'),
  body('mediaUrl').optional({ checkFalsy: true }).custom(isValidMediaUrl).withMessage('Media URL must be an HTTP(S) URL or an uploaded resource path.').isLength({ max: 2048 }).withMessage('Media URL must be 2048 characters or fewer.'),
];

const updateContentValidation = [
  body().custom((_, { req }) => {
    if (!Object.values(req.files || {}).flat().length && !updateFields.some((field) => req.body[field] !== undefined)) {
      throw new Error('Provide at least one field to update.');
    }
    return true;
  }),
  body('title').optional().isString().withMessage('Title must be text.')
    .bail().trim().notEmpty().withMessage('Title cannot be empty.')
    .isLength({ max: 200 }).withMessage('Title must be 200 characters or fewer.'),
  body('titles').optional().custom((value) => validateTranslations(value, 'Titles', 200, true)),
  body('description').optional().isString().withMessage('Description must be text.').isLength({ max: 5000 }).withMessage('Description must be 5000 characters or fewer.'),
  body('bodies').optional().custom((value) => validateTranslations(value, 'Descriptions', 5000)),
  body('category').optional().isIn(contentCategories).withMessage('Choose a valid content category.'),
  body('image').optional().isString().withMessage('Image must be a URL or image path.').isLength({ max: 2048 }).withMessage('Image path must be 2048 characters or fewer.'),
  body('mediaUrl').optional({ checkFalsy: true }).custom(isValidMediaUrl).withMessage('Media URL must be an HTTP(S) URL or an uploaded resource path.').isLength({ max: 2048 }).withMessage('Media URL must be 2048 characters or fewer.'),
];

module.exports = {
  contentIdValidation,
  contentListValidation,
  createContentValidation,
  updateContentValidation,
  contentCategories,
};

const ApiError = require('../utils/ApiError');

const supportedLanguages = new Set(['en', 'am', 'om']);

const parseTranslations = (value, fieldName) => {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      throw new ApiError(400, `${fieldName} must contain valid JSON.`);
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, `${fieldName} must be an object of language values.`);
  }

  const result = {};
  for (const [language, text] of Object.entries(value)) {
    if (!supportedLanguages.has(language) || typeof text !== 'string') {
      throw new ApiError(400, `${fieldName} supports only en, am, and om text values.`);
    }
    result[language] = text.trim();
  }
  return result;
};

const parseContentFields = (req, res, next) => {
  try {
    if (req.body.titles !== undefined) {
      req.body.titles = parseTranslations(req.body.titles, 'titles');
      req.body.title = req.body.titles.en || req.body.titles.am || req.body.titles.om || req.body.title;
    }
    if (req.body.bodies !== undefined) {
      req.body.bodies = parseTranslations(req.body.bodies, 'bodies');
      req.body.description = req.body.bodies.en || req.body.bodies.am || req.body.bodies.om || req.body.description || '';
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = parseContentFields;

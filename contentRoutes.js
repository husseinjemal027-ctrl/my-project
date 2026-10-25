const express = require('express');
const {
  createContent,
  getAllContent,
  getMyContent,
  getContentFile,
  getContentById,
  updateContent,
  patchContent,
  deleteContent,
} = require('../controllers/contentController');
const auth = require('../middleware/auth');
const { uploadContentFiles, cleanupUploadedFiles } = require('../middleware/upload');
const validate = require('../middleware/validate');
const parseContentFields = require('../middleware/parseContentFields');
const ApiError = require('../utils/ApiError');
const {
  createContentValidation,
  updateContentValidation,
  contentIdValidation,
  contentListValidation,
} = require('../validators/contentValidator');

const router = express.Router();

const requireContentTitle = (req, res, next) => {
  const title = req.body.title || req.body.titles?.en || req.body.titles?.am || req.body.titles?.om;
  if (typeof title !== 'string' || !title.trim()) {
    return next(new ApiError(400, 'Add a title in at least one language.'));
  }
  return next();
};

router.get('/', validate(contentListValidation), getAllContent);
router.get('/mine', auth, validate(contentListValidation), getMyContent);
router.get('/files/:fileId', getContentFile);
router.get('/:id', validate(contentIdValidation), getContentById);
router.post('/', auth, cleanupUploadedFiles, uploadContentFiles, parseContentFields, requireContentTitle, validate(createContentValidation), createContent);
router.put('/:id', auth, cleanupUploadedFiles, uploadContentFiles, parseContentFields, validate([...contentIdValidation, ...updateContentValidation]), updateContent);
router.patch('/:id', auth, cleanupUploadedFiles, uploadContentFiles, parseContentFields, validate([...contentIdValidation, ...updateContentValidation]), patchContent);
router.delete('/:id', auth, validate(contentIdValidation), deleteContent);

module.exports = router;

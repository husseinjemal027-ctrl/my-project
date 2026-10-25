const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const uploadDir = path.join(__dirname, '../uploads');
const stagingDir = path.join(uploadDir, '.staging');
const configuredMaxImageSizeMb = Number(process.env.MAX_FILE_SIZE_MB || '5');
const configuredMaxMediaSizeMb = Number(process.env.MAX_MEDIA_FILE_SIZE_MB || '100');

if (!Number.isInteger(configuredMaxImageSizeMb) || configuredMaxImageSizeMb < 1 || configuredMaxImageSizeMb > 5) {
  throw new Error('MAX_FILE_SIZE_MB must be a whole number between 1 and 5.');
}

if (!Number.isInteger(configuredMaxMediaSizeMb) || configuredMaxMediaSizeMb < 1 || configuredMaxMediaSizeMb > 500) {
  throw new Error('MAX_MEDIA_FILE_SIZE_MB must be a whole number between 1 and 500.');
}

fs.mkdirSync(stagingDir, { recursive: true });

const imageTypes = {
  'image/jpeg': {
    extension: '.jpg',
    matches: (head, tail, size) => size >= 4
      && head[0] === 0xff
      && head[1] === 0xd8
      && head[2] === 0xff
      && tail[tail.length - 2] === 0xff
      && tail[tail.length - 1] === 0xd9,
  },
  'image/png': {
    extension: '.png',
    matches: (head, tail, size) => size >= 33
      && head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      && head.readUInt32BE(8) === 13
      && head.toString('ascii', 12, 16) === 'IHDR'
      && head.readUInt32BE(16) > 0
      && head.readUInt32BE(20) > 0
      && tail.subarray(-8, -4).toString('ascii') === 'IEND',
  },
  'image/webp': {
    extension: '.webp',
    matches: (head, _tail, size) => size >= 20
      && head.toString('ascii', 0, 4) === 'RIFF'
      && head.readUInt32LE(4) === size - 8
      && head.toString('ascii', 8, 12) === 'WEBP',
  },
  'image/gif': {
    extension: '.gif',
    matches: (head, tail, size) => size >= 14
      && ['GIF87a', 'GIF89a'].includes(head.toString('ascii', 0, 6))
      && head.readUInt16LE(6) > 0
      && head.readUInt16LE(8) > 0
      && tail[tail.length - 1] === 0x3b,
  },
};

const mediaTypes = {
  'application/pdf': {
    extension: '.pdf',
    kind: 'document',
    matches: (head) => head.toString('ascii', 0, 5) === '%PDF-',
  },
  'application/epub+zip': {
    extension: '.epub',
    kind: 'document',
    matches: (head) => head.length >= 4
      && head[0] === 0x50
      && head[1] === 0x4b
      && [0x03, 0x05, 0x07].includes(head[2])
      && [0x04, 0x06, 0x08].includes(head[3]),
  },
  'audio/mpeg': {
    extension: '.mp3',
    kind: 'audio',
    matches: (head) => head.toString('ascii', 0, 3) === 'ID3'
      || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0),
  },
  'audio/wav': {
    extension: '.wav',
    kind: 'audio',
    matches: (head) => head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WAVE',
  },
  'audio/x-wav': {
    extension: '.wav',
    kind: 'audio',
    matches: (head) => head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WAVE',
  },
  'audio/mp4': {
    extension: '.m4a',
    kind: 'audio',
    matches: (head) => head.toString('ascii', 4, 8) === 'ftyp',
  },
  'audio/ogg': {
    extension: '.ogg',
    kind: 'audio',
    matches: (head) => head.toString('ascii', 0, 4) === 'OggS',
  },
  'video/mp4': {
    extension: '.mp4',
    kind: 'video',
    matches: (head) => head.toString('ascii', 4, 8) === 'ftyp',
  },
  'video/quicktime': {
    extension: '.mov',
    kind: 'video',
    matches: (head) => head.toString('ascii', 4, 8) === 'ftyp',
  },
  'video/webm': {
    extension: '.webm',
    kind: 'video',
    matches: (head) => head.length >= 4 && head.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
  },
};

const allowedTypes = { ...imageTypes, ...mediaTypes };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, stagingDir),
  filename: (_req, file, cb) => {
    const type = allowedTypes[file.mimetype];
    cb(null, `${randomUUID()}${type?.extension || '.upload'}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const type = file.fieldname === 'image' ? imageTypes[file.mimetype] : mediaTypes[file.mimetype];
  if (type) {
    cb(null, true);
  } else if (file.fieldname === 'image') {
    cb(new ApiError(400, 'Cover images must be JPG, PNG, WEBP, or GIF.'));
  } else {
    cb(new ApiError(400, 'Resource files must be PDF, EPUB, MP3, WAV, M4A, OGG, MP4, MOV, or WEBM.'));
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: configuredMaxMediaSizeMb * 1024 * 1024,
    files: 2,
    fields: 20,
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'resourceFile', maxCount: 1 },
]);

const getUploadedFiles = (req) => Object.values(req.files || {}).flat();

const removeFile = async (filepath) => {
  if (!filepath || path.dirname(filepath) !== stagingDir && path.dirname(filepath) !== uploadDir) {
    return;
  }
  await fs.promises.unlink(filepath).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
};

const cleanupUploadedFiles = (req, res, next) => {
  res.once('finish', () => {
    Promise.all(getUploadedFiles(req).map((file) => removeFile(file.path)))
      .catch((error) => console.error('Failed to clean up staged content uploads:', error.message));
  });
  next();
};

const validateUploadedContent = async (req, _res, next) => {
  try {
    const files = getUploadedFiles(req);
    for (const file of files) {
      const isImage = file.fieldname === 'image';
      const maxSize = (isImage ? configuredMaxImageSizeMb : configuredMaxMediaSizeMb) * 1024 * 1024;
      if (file.size > maxSize) {
        throw new ApiError(413, isImage
          ? `Cover images must be ${configuredMaxImageSizeMb} MB or smaller.`
          : `Resource files must be ${configuredMaxMediaSizeMb} MB or smaller.`);
      }

      const type = allowedTypes[file.mimetype];
      const handle = await fs.promises.open(file.path, 'r');
      let head;
      let tail;
      try {
        head = Buffer.alloc(Math.min(file.size, 32));
        await handle.read(head, 0, head.length, 0);
        tail = Buffer.alloc(Math.min(file.size, 8));
        await handle.read(tail, 0, tail.length, Math.max(0, file.size - tail.length));
      } finally {
        await handle.close();
      }

      if (!type || !type.matches(head, tail, file.size)) {
        throw new ApiError(400, 'Uploaded file content does not match its permitted file type.');
      }

      if (isImage) req.validatedImageType = type;
      else req.validatedMediaType = type;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const uploadContentFiles = (req, res, next) => {
  multerUpload(req, res, (error) => {
    if (error) return next(error);
    return validateUploadedContent(req, res, next);
  });
};

module.exports = {
  uploadContentFiles,
  cleanupUploadedFiles,
  removeFile,
};

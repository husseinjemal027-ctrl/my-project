const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const bucketName = 'contentFiles';

function getBucket() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new ApiError(503, 'Database is unavailable. Check the MongoDB Atlas connection and try again.');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
}

async function saveContentFile(file, type) {
  const fileId = new mongoose.mongo.ObjectId();
  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(`${fileId.toString()}${type.extension}`, {
    id: fileId,
    metadata: {
      contentType: file.mimetype,
      mediaType: type.kind || 'image',
      extension: type.extension,
      downloadName: (file.originalname || `resource${type.extension}`)
        .replace(/\\/g, '/')
        .split('/')
        .pop()
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .trim()
        .slice(0, 180) || `resource${type.extension}`,
    },
  });

  await pipeline(fs.createReadStream(file.path), uploadStream);

  return {
    fileId,
    url: `/api/content/files/${fileId.toString()}`,
    mediaType: type.kind || file.mimetype,
  };
}

async function findContentFile(fileId) {
  if (!mongoose.mongo.ObjectId.isValid(fileId) || fileId.length !== 24) {
    return null;
  }
  return getBucket().find({ _id: new mongoose.mongo.ObjectId(fileId) }).next();
}

async function removeStoredContentFile(fileUrl) {
  const gridFsMatch = typeof fileUrl === 'string'
    && fileUrl.match(/^\/api\/content\/files\/([0-9a-f]{24})$/i);
  if (gridFsMatch) {
    const bucket = getBucket();
    const fileId = new mongoose.mongo.ObjectId(gridFsMatch[1]);
    const existing = await bucket.find({ _id: fileId }).next();
    if (existing) await bucket.delete(fileId);
    return;
  }

  const localMatch = typeof fileUrl === 'string'
    && fileUrl.match(/^\/uploads\/([0-9a-f-]+\.(?:jpg|png|webp|gif|pdf|epub|mp3|wav|m4a|ogg|mp4|mov|webm))$/i);
  if (localMatch) {
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.promises.unlink(path.join(uploadDir, localMatch[1])).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

module.exports = {
  getBucket,
  findContentFile,
  removeStoredContentFile,
  saveContentFile,
};

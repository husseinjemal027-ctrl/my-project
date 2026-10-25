const Content = require('../models/Content');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const {
  getBucket,
  findContentFile,
  removeStoredContentFile,
  saveContentFile,
} = require('../services/contentFileStorage');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createContent = async (req, res, next) => {
  let savedImage;
  let savedResource;
  try {
    const { title, description, category, image } = req.body;
    const imageFile = req.files?.image?.[0];
    const resourceFile = req.files?.resourceFile?.[0];
    if (imageFile) savedImage = await saveContentFile(imageFile, req.validatedImageType);
    if (resourceFile) savedResource = await saveContentFile(resourceFile, req.validatedMediaType);

    const content = await Content.create({
      title,
      description,
      titles: req.body.titles,
      bodies: req.body.bodies,
      category,
      image: savedImage ? savedImage.url : image,
      mediaUrl: savedResource ? savedResource.url : req.body.mediaUrl,
      mediaType: savedResource ? savedResource.mediaType : '',
      author: req.user._id,
    });

    return res.status(201).json(ApiResponse.success('Content created successfully.', content, 201));
  } catch (error) {
    if (savedImage) {
      await removeStoredContentFile(savedImage.url).catch((cleanupError) => {
        console.error('Failed to remove an unreferenced image after content creation failed:', cleanupError.message);
      });
    }
    if (savedResource) {
      await removeStoredContentFile(savedResource.url).catch((cleanupError) => {
        console.error('Failed to remove an unreferenced resource after content creation failed:', cleanupError.message);
      });
    }
    return next(error);
  }
};

const getAllContent = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page || '1', 10);
    const limit = Number.parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      const searchExpression = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      filter.$or = [
        { title: searchExpression },
        { description: searchExpression },
        { 'titles.en': searchExpression },
        { 'titles.am': searchExpression },
        { 'titles.om': searchExpression },
        { 'bodies.en': searchExpression },
        { 'bodies.am': searchExpression },
        { 'bodies.om': searchExpression },
      ];
    }
    const [items, totalItems] = await Promise.all([
      Content.find(filter).populate('author', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Content.countDocuments(filter),
    ]);
    return res.status(200).json(ApiResponse.success('Content fetched successfully.', {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }));
  } catch (error) {
    return next(error);
  }
};

const getMyContent = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page || '1', 10);
    const limit = Number.parseInt(req.query.limit || '9', 10);
    const skip = (page - 1) * limit;
    const filter = { author: req.user._id };
    const [items, totalItems] = await Promise.all([
      Content.find(filter).populate('author', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Content.countDocuments(filter),
    ]);
    return res.status(200).json(ApiResponse.success('Your content fetched successfully.', {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }));
  } catch (error) {
    return next(error);
  }
};

const getContentById = async (req, res, next) => {
  try {
    const item = await Content.findById(req.params.id).populate('author', 'name email');

    if (!item) {
      return next(new ApiError(404, 'Content not found.'));
    }

    return res.status(200).json(ApiResponse.success('Content fetched successfully.', item));
  } catch (error) {
    return next(error);
  }
};

const getContentFile = async (req, res, next) => {
  try {
    const file = await findContentFile(req.params.fileId);
    if (!file) return next(new ApiError(404, 'Content file not found.'));

    let start = 0;
    let end = file.length - 1;
    const range = req.get('range');
    if (range) {
      const match = range.match(/^bytes=(\d*)-(\d*)$/);
      if (!match || file.length === 0) {
        res.set('Content-Range', `bytes */${file.length}`);
        return res.status(416).end();
      }

      if (!match[1]) {
        const suffixLength = Number(match[2]);
        if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
          res.set('Content-Range', `bytes */${file.length}`);
          return res.status(416).end();
        }
        start = Math.max(file.length - suffixLength, 0);
      } else {
        start = Number(match[1]);
        end = match[2] ? Number(match[2]) : end;
      }

      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= file.length) {
        res.set('Content-Range', `bytes */${file.length}`);
        return res.status(416).end();
      }
      end = Math.min(end, file.length - 1);
    }

    const contentLength = file.length === 0 ? 0 : end - start + 1;
    res.status(range ? 206 : 200);
    res.set({
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Content-Length': String(contentLength),
      'Content-Type': file.metadata?.contentType || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.query.download === '1') {
      res.attachment(file.metadata?.downloadName || file.filename);
      res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
    } else {
      res.set('Content-Disposition', 'inline');
    }
    if (range) res.set('Content-Range', `bytes ${start}-${end}/${file.length}`);

    const stream = getBucket().openDownloadStream(
      file._id,
      range ? { start, end: end + 1 } : undefined,
    );
    stream.once('error', (error) => {
      if (res.headersSent) {
        console.error('Failed while streaming a content file from MongoDB:', error.message);
        res.destroy(error);
      } else {
        next(error);
      }
    });
    res.once('close', () => {
      if (!res.writableEnded) stream.destroy();
    });
    return stream.pipe(res);
  } catch (error) {
    return next(error);
  }
};

const updateContent = async (req, res, next) => {
  let savedImage;
  let savedResource;
  let previousImage;
  let previousResource;
  try {
    const item = await Content.findById(req.params.id);

    if (!item) {
      return next(new ApiError(404, 'Content not found.'));
    }

    if (String(item.author) !== String(req.user._id)) {
      return next(new ApiError(403, 'You are not allowed to update this content.'));
    }

    const imageFile = req.files?.image?.[0];
    const resourceFile = req.files?.resourceFile?.[0];
    if (imageFile) savedImage = await saveContentFile(imageFile, req.validatedImageType);
    if (resourceFile) savedResource = await saveContentFile(resourceFile, req.validatedMediaType);
    const originalMediaUrl = item.mediaUrl;
    const allowedFields = ['title', 'description', 'titles', 'bodies', 'category', 'image', 'mediaUrl'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });
    if (req.body.mediaUrl !== undefined && req.body.mediaUrl !== originalMediaUrl) {
      previousResource = originalMediaUrl;
      item.mediaType = '';
    }
    if (savedImage) {
      previousImage = item.image;
      item.image = savedImage.url;
    }
    if (savedResource) {
      previousResource = originalMediaUrl;
      item.mediaUrl = savedResource.url;
      item.mediaType = savedResource.mediaType;
    }

    await item.save();
    if (previousImage) {
      await removeStoredContentFile(previousImage).catch((cleanupError) => {
        console.error('Failed to remove a replaced content image:', cleanupError.message);
      });
    }
    if (previousResource) {
      await removeStoredContentFile(previousResource).catch((cleanupError) => {
        console.error('Failed to remove a replaced content resource:', cleanupError.message);
      });
    }
    return res.status(200).json(ApiResponse.success('Content updated successfully.', item));
  } catch (error) {
    if (savedImage) {
      await removeStoredContentFile(savedImage.url).catch((cleanupError) => {
        console.error('Failed to remove an unreferenced image after content update failed:', cleanupError.message);
      });
    }
    if (savedResource) {
      await removeStoredContentFile(savedResource.url).catch((cleanupError) => {
        console.error('Failed to remove an unreferenced resource after content update failed:', cleanupError.message);
      });
    }
    return next(error);
  }
};

const patchContent = updateContent;

const deleteContent = async (req, res, next) => {
  try {
    const item = await Content.findById(req.params.id);

    if (!item) {
      return next(new ApiError(404, 'Content not found.'));
    }

    if (String(item.author) !== String(req.user._id)) {
      return next(new ApiError(403, 'You are not allowed to delete this content.'));
    }

    await item.deleteOne();
    await removeStoredContentFile(item.image).catch((cleanupError) => {
      console.error('Failed to remove a deleted content image:', cleanupError.message);
    });
    await removeStoredContentFile(item.mediaUrl).catch((cleanupError) => {
      console.error('Failed to remove a deleted content resource:', cleanupError.message);
    });
    return res.status(200).json(ApiResponse.success('Content deleted successfully.'));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createContent,
  getAllContent,
  getMyContent,
  getContentById,
  getContentFile,
  updateContent,
  patchContent,
  deleteContent,
};

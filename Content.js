const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    titles: {
      en: { type: String, default: '' },
      am: { type: String, default: '' },
      om: { type: String, default: '' },
    },
    bodies: {
      en: { type: String, default: '' },
      am: { type: String, default: '' },
      om: { type: String, default: '' },
    },
    category: {
      type: String,
      default: 'quran',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    mediaUrl: {
      type: String,
      default: '',
      trim: true,
    },
    mediaType: {
      type: String,
      default: '',
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

contentSchema.index({ createdAt: -1 });
contentSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.models.Content || mongoose.model('Content', contentSchema);

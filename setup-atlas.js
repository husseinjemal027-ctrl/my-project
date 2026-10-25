const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Content = require('../models/Content');
const ContactMessage = require('../models/ContactMessage');

async function ensureCollection(db, name) {
  const exists = await db.listCollections({ name }, { nameOnly: true }).hasNext();
  if (!exists) {
    try {
      await db.createCollection(name);
    } catch (error) {
      if (error.code !== 48) throw error;
    }
  }
}

async function ensureGridFs(db) {
  const files = 'contentFiles.files';
  const chunks = 'contentFiles.chunks';
  await ensureCollection(db, files);
  await ensureCollection(db, chunks);
  await db.collection(files).createIndex({ filename: 1, uploadDate: 1 });
  await db.collection(chunks).createIndex({ files_id: 1, n: 1 }, { unique: true });
}

async function setupAtlas() {
  await connectDB();
  const expectedDbName = process.env.MONGO_DB_NAME?.trim() || 'ism';
  if (mongoose.connection.name !== expectedDbName) {
    throw new Error(`Connected database is "${mongoose.connection.name}", not the required "${expectedDbName}". Set MONGO_DB_NAME=${expectedDbName} before setup.`);
  }

  const db = mongoose.connection.db;
  const models = [User, Content, ContactMessage];
  for (const model of models) {
    await ensureCollection(db, model.collection.collectionName);
    await model.createIndexes();
  }
  await ensureGridFs(db);

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  console.log(`Atlas database "${mongoose.connection.name}" is ready.`);
  console.log(`Collections: ${collections.map((item) => item.name).sort().join(', ')}`);
  for (const model of models) {
    const indexes = await db.collection(model.collection.collectionName).indexes();
    console.log(`${model.collection.collectionName} indexes: ${indexes.map((index) => index.name).join(', ')}`);
  }
  console.log('contentFiles GridFS indexes: filename_1_uploadDate_1, files_id_1_n_1 (unique)');
}

setupAtlas()
  .catch((error) => {
    console.error(`Atlas setup failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });

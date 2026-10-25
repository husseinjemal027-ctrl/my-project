const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false);

function getMongoUri() {
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing or empty. Set it in backend/.env using the URI from MongoDB Atlas.');
  }

  if (/(?:YOUR_|PASTE_|REPLACE_|<[^>]+>|username:password@|xxxxx|example\.mongodb\.net)/i.test(mongoUri)) {
    throw new Error('MONGODB_URI still contains placeholder text. Copy the real connection URI from MongoDB Atlas into backend/.env.');
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    throw new Error('MONGODB_URI is malformed. It must start with mongodb:// or mongodb+srv://.');
  }

  try {
    const parsedUri = new URL(mongoUri);
    if (!parsedUri.hostname) {
      throw new Error('MONGODB_URI has no hostname.');
    }
  } catch {
    throw new Error('MONGODB_URI is malformed. Check the Atlas connection URI in backend/.env.');
  }

  return mongoUri;
}

function redactSensitiveValues(message, mongoUri) {
  let safeMessage = String(message || 'Unknown connection error');
  const sensitiveValues = [mongoUri, process.env.JWT_SECRET];

  try {
    const parsedUri = new URL(mongoUri);
    sensitiveValues.push(
      parsedUri.username,
      parsedUri.password,
      decodeURIComponent(parsedUri.username),
      decodeURIComponent(parsedUri.password),
    );
  } catch {
    // The URI is validated before this function is called.
  }

  for (const value of sensitiveValues) {
    if (value) {
      safeMessage = safeMessage.replaceAll(value, '[redacted]');
    }
  }

  return safeMessage
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/gi, '[redacted MongoDB URI]')
    .replace(/(password|passwd|pwd|username|user)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]');
}

function getConnectionErrorDetail(error) {
  const topologyError = error.reason || error.cause;
  const servers = topologyError?.servers;
  if (servers && typeof servers.values === 'function') {
    const messages = new Set();
    for (const server of servers.values()) {
      const serverError = server.error || server.description?.error;
      if (serverError?.message) {
        messages.add(serverError.message);
      }
    }
    if (messages.size) {
      const detail = [...messages].join('; ');
      if (/ENOTFOUND|querySrv/i.test(detail)) {
        return `Atlas DNS/SRV lookup failed: ${detail}. Verify the exact cluster hostname in MongoDB Atlas under Database > Connect > Drivers > Node.js; replace any placeholder hostname such as xxxxx and ensure DNS SRV lookups are available.`;
      }
      if (/tlsv1 alert internal error|SSL alert number 80/i.test(detail)) {
        return `Atlas hosts resolved and accepted TCP connections, but rejected the TLS handshake: ${detail}. Verify this URI was copied from the active cluster's Database > Connect > Drivers > Node.js page, check the cluster state and Network Access IP Access List, and try a different network if those settings are correct. Do not disable TLS.`;
      }
      return detail;
    }
  }

  return topologyError?.message || error.message;
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return mongoose.connection;
  }

  const mongoUri = getMongoUri();

  try {
    const uriDatabaseName = decodeURIComponent(new URL(mongoUri).pathname.slice(1));
    const dbName = process.env.MONGO_DB_NAME?.trim() || uriDatabaseName || 'ism';
    await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB connected to database "${dbName}".`);
    return mongoose.connection;
  } catch (error) {
    const detail = redactSensitiveValues(getConnectionErrorDetail(error), mongoUri);
    throw new Error(`MongoDB connection failed: ${detail}`, { cause: error });
  }
}

module.exports = connectDB;

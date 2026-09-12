const mongoose = require('mongoose');

const config = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * One connection, reused across Vercel invocations that land in the same
 * isolate. A new connect() on every request would burn the request budget
 * opening Atlas and then time out.
 */
let connecting = null;
let listenersBound = false;

function bindListeners() {
  if (listenersBound) return;
  listenersBound = true;
  mongoose.connection.on('error', (error) => console.error('MongoDB error:', error.message));
  mongoose.connection.on('disconnected', () => {
    connecting = null;
    console.warn('MongoDB disconnected');
  });
}

/**
 * Ready the database. Local `npm start` still calls this once before listen.
 * On Vercel it runs from the request middleware, and is a no-op when already
 * connected.
 */
async function connect() {
  if (!config.mongoUri) {
    throw ApiError.badGateway('db_unconfigured', 'Database is not configured');
  }

  if (mongoose.connection.readyState === 1) return;
  if (connecting) return connecting;

  mongoose.set('strictQuery', true);
  // Fail immediately if the link dropped, rather than parking the request.
  mongoose.set('bufferCommands', false);
  bindListeners();

  connecting = mongoose
    .connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      // Serverless isolates should not hold a large idle pool.
      maxPoolSize: config.serverless ? 5 : 10,
    })
    .catch((error) => {
      connecting = null;
      throw error;
    });

  return connecting;
}

module.exports = { connect };

const mongoose = require('mongoose');

const config = require('../config/env');

/**
 * Connects before the server starts listening, so the app never accepts a
 * request it has no database to answer with.
 */
async function connect() {
  mongoose.set('strictQuery', true);
  // The connection is established before the server listens, so a query with no
  // connection means the link dropped. Fail it immediately rather than parking
  // the request for ten seconds and answering 500 anyway.
  mongoose.set('bufferCommands', false);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });

  mongoose.connection.on('error', (error) => console.error('MongoDB error:', error.message));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
}

module.exports = { connect };

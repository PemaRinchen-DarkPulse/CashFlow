const crypto = require('crypto');

const {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const config = require('../config/env');
const ApiError = require('../utils/ApiError');

/** The longest a SigV4 presigned URL may live. */
const SIGNED_URL_TTL = 7 * 24 * 60 * 60;

/** What a goal picture may be. Anything else is refused before it is uploaded. */
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

/** Generous for a cropped phone photo, small enough to bound one request. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Built once and reused. `forcePathStyle` is not optional for Filebase: it
 * addresses buckets as s3.filebase.com/<bucket>, and the SDK's default of
 * <bucket>.s3.filebase.com resolves to nothing.
 */
let client = null;

function s3() {
  if (!config.filebase.configured) {
    throw ApiError.badRequest(
      'storage_unconfigured',
      'File storage is not set up on the server yet'
    );
  }
  if (!client) {
    client = new S3Client({
      region: config.filebase.region,
      endpoint: config.filebase.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.filebase.accessKeyId,
        secretAccessKey: config.filebase.secretAccessKey,
      },
    });
  }
  return client;
}

function isConfigured() {
  return config.filebase.configured;
}

/**
 * Remembers that the bucket is there, so the check costs one request per boot
 * rather than one per upload.
 */
let bucketReady = false;

/**
 * Make sure the configured bucket exists, creating it if it does not.
 *
 * Saves having to provision storage by hand before the first upload, and makes
 * a fresh deployment or a new set of credentials work on its own.
 *
 * Only a genuine "not there" leads to a create. A permissions failure or an
 * outage must not be mistaken for an absent bucket, or the server would try to
 * create one on every upload and bury the real error underneath.
 */
async function ensureBucket() {
  if (bucketReady) return;
  const Bucket = config.filebase.bucket;

  try {
    await s3().send(new HeadBucketCommand({ Bucket }));
    bucketReady = true;
    return;
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    const code = error?.Code || error?.name || '';
    const absent = status === 404 || code === 'NoSuchBucket' || code === 'NotFound';
    if (!absent) throw describeStorageFailure(error);
  }

  try {
    await s3().send(new CreateBucketCommand({ Bucket }));
    console.log(`Filebase: bucket "${Bucket}" did not exist — created it.`);
    bucketReady = true;
  } catch (error) {
    // Created by something else between the check and here, which is the state
    // this wanted anyway.
    if ((error?.Code || error?.name) === 'BucketAlreadyOwnedByYou') {
      bucketReady = true;
      return;
    }
    throw describeStorageFailure(error);
  }
}

/**
 * Check an uploaded file before it costs a round trip.
 *
 * The declared content type is not trusted on its own — it is whatever the
 * client wrote in the request — so the first bytes are read as well. A file
 * claiming to be a PNG that does not start with a PNG signature is refused.
 */
function assertUsableImage(file) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw ApiError.badRequest('invalid_image', 'That file is empty');
  }
  if (file.buffer.length > MAX_BYTES) {
    throw ApiError.badRequest('image_too_large', 'Pick an image under 8 MB');
  }

  const extension = ALLOWED_TYPES[file.mimetype];
  if (!extension) {
    throw ApiError.badRequest('invalid_image', 'Use a JPG, PNG, WebP or HEIC image');
  }

  if (!looksLikeImage(file.buffer)) {
    throw ApiError.badRequest('invalid_image', 'That file is not a readable image');
  }

  return extension;
}

/** Magic numbers for the formats above. */
function looksLikeImage(buffer) {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return true;
  }
  // RIFF....WEBP
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return true;
  }
  // HEIC/HEIF: an ISO-BMFF box whose brand starts "ftyp".
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') return true;

  return false;
}

/**
 * Where an object lives in the bucket. Keyed by user first so one person's
 * files sit under one prefix, which makes them listable and removable together
 * if that account ever goes.
 */
function buildKey(userId, goalId, extension) {
  const unique = crypto.randomBytes(8).toString('hex');
  return `goals/${userId}/${goalId}/${Date.now().toString(36)}-${unique}.${extension}`;
}

/**
 * Put a goal picture in the bucket and hand back what Mongo should remember.
 *
 * Only metadata is returned — never the bytes. The file lives in Filebase and
 * the database keeps the small record needed to find, show and delete it, so
 * reading a goal never pulls an image through the database.
 */
async function uploadGoalImage({ userId, goalId, file }) {
  const extension = assertUsableImage(file);
  // Checked after the file is validated, so a bad upload never provisions
  // storage it was never going to use.
  await ensureBucket();
  const key = buildKey(userId, goalId, extension);

  let result;
  try {
    result = await s3().send(
      new PutObjectCommand({
        Bucket: config.filebase.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Filebase pins to IPFS and returns the content id on the response,
        // which is worth keeping: it identifies the bytes themselves, so it
        // stays valid even if the object is later served from somewhere else.
        Metadata: { 'original-name': safeName(file.originalname) },
      })
    );
  } catch (error) {
    throw describeStorageFailure(error);
  }

  return {
    key,
    url: publicUrl(key),
    cid: readCid(result),
    size: file.buffer.length,
    contentType: file.mimetype,
    uploadedAt: new Date(),
  };
}

/**
 * Remove an object. Never throws: a picture that is already gone is the state
 * the caller wanted, and a goal must still be deletable when storage is down.
 */
async function deleteObject(key) {
  if (!key || !config.filebase.configured) return;
  try {
    await s3().send(
      new DeleteObjectCommand({ Bucket: config.filebase.bucket, Key: key })
    );
  } catch {
    // Left in the bucket rather than blocking the database write.
  }
}

/**
 * A link the app can actually load.
 *
 * The bucket is private, so the plain object URL answers 403 to anyone without
 * the account's keys — which is every phone running this app. A presigned URL
 * carries a signature in the query string that grants read access to this one
 * object for a limited time, so the picture stays private without the client
 * ever holding a credential.
 *
 * Seven days is the longest SigV4 allows. The app reads its goals on launch and
 * `expo-image` caches what it has already fetched, so a link is refreshed long
 * before it lapses.
 */
async function signedUrl(key, seconds = SIGNED_URL_TTL) {
  if (!key) return null;
  try {
    return await getSignedUrl(
      s3(),
      new GetObjectCommand({ Bucket: config.filebase.bucket, Key: key }),
      { expiresIn: seconds }
    );
  } catch (error) {
    // A goal is still worth showing without its picture.
    console.error('Filebase: could not sign url for', key, '-', error?.message || error);
    return null;
  }
}

function publicUrl(key) {
  const base = config.filebase.endpoint.replace(/\/+$/, '');
  // Path style, matching `forcePathStyle` above.
  return `${base}/${config.filebase.bucket}/${key}`;
}

/**
 * Turn an S3 failure into something the client can act on.
 *
 * Left alone these reach the error handler unrecognised and become a 500, which
 * tells a user their upload broke the server when in fact the bucket name is
 * wrong. The operator-facing detail is logged; the client gets the short line.
 */
function describeStorageFailure(error) {
  const code = error?.Code || error?.name || '';
  console.error(`Filebase ${code || 'error'}:`, error?.message || error);

  switch (code) {
    case 'NoSuchBucket':
      return ApiError.badGateway(
        'storage_bucket_missing',
        'File storage is misconfigured on the server'
      );
    /**
     * Bucket names are global across all of Filebase, not per account. This is
     * the name being held by somebody else — including another account of the
     * operator's own, which is the likely case when a key has just been swapped.
     */
    case 'BucketAlreadyExists':
      return ApiError.badGateway(
        'storage_bucket_taken',
        'The storage bucket name is already taken — pick another'
      );
    case 'TooManyBuckets':
      return ApiError.badGateway(
        'storage_bucket_limit',
        'File storage has no room for another bucket'
      );
    /**
     * The name itself is not a legal S3 bucket name, so no account could hold
     * it. Almost always a capital letter — the rules are lowercase only.
     */
    case 'InvalidBucketName':
      return ApiError.badGateway(
        'storage_bucket_invalid',
        'The storage bucket name is not valid'
      );
    case 'InvalidAccessKeyId':
    case 'SignatureDoesNotMatch':
    case 'AccessDenied':
      return ApiError.badGateway(
        'storage_rejected',
        'File storage rejected the server’s credentials'
      );
    case 'EntityTooLarge':
      return ApiError.badRequest('image_too_large', 'Pick a smaller image');
    default:
      return ApiError.badGateway('storage_unavailable', 'Could not store the image right now');
  }
}

/** Filebase returns the IPFS CID in a response header, casing unspecified. */
function readCid(result) {
  const headers = result?.$metadata?.httpHeaders || {};
  return (
    headers['x-amz-meta-cid'] ||
    headers['X-Amz-Meta-Cid'] ||
    result?.Metadata?.cid ||
    ''
  );
}

/** Header values must stay ASCII, and the name is only ever a label. */
function safeName(name) {
  return String(name || 'image')
    .replace(/[^\w.\- ]+/g, '')
    .slice(0, 100);
}

module.exports = {
  ALLOWED_TYPES,
  MAX_BYTES,
  SIGNED_URL_TTL,
  isConfigured,
  uploadGoalImage,
  deleteObject,
  signedUrl,
  publicUrl,
};

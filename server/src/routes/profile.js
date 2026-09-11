const express = require('express');
const multer = require('multer');

const filebase = require('../services/filebase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const presentUser = require('../utils/presentUser');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: filebase.MAX_BYTES, files: 2 },
});

function isFlag(value) {
  return value === true || value === 'true';
}

function firstFile(files, field) {
  const list = files?.[field];
  return Array.isArray(list) && list[0] ? list[0] : null;
}

/**
 * Apply one photo slot: put the bytes in Filebase, then remember only the
 * metadata on the user.
 *
 * Nested `avatar` / `cover` start as `null`. Assigning a subdocument onto a
 * null path is not always seen as dirty in Mongoose 9, so `save()` would leave
 * Mongo empty while Filebase already holds the file. Marking the path is what
 * actually writes `{ key, url, cid, size, contentType, uploadedAt }`.
 */
async function applySlot(user, kind, file, remove) {
  if (file) {
    const image = await filebase.uploadProfileImage({
      userId: user._id.toString(),
      kind,
      file,
    });
    const supersededKey = user[kind]?.key || null;
    user.set(kind, image);
    user.markModified(kind);
    return { supersededKey, uploadedKey: image.key };
  }

  if (isFlag(remove)) {
    const supersededKey = user[kind]?.key || null;
    user.set(kind, null);
    user.markModified(kind);
    return { supersededKey, uploadedKey: null };
  }

  return { supersededKey: null, uploadedKey: null };
}

/**
 * GET /api/me/summary — the signed-in user, with photos signed for the phone.
 *
 * Kept next to the photo writes because both are the account itself rather
 * than a list the user has many of.
 */
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    res.json({ user: await presentUser(req.user) });
  })
);

/**
 * PATCH /api/me/photos — set or clear the profile picture and cover.
 *
 * Accepts JSON or multipart. `upload.fields` ignores a request that is not
 * multipart, so removing a photo without sending a file is a plain JSON body.
 *
 * Sending a new file replaces the picture; the one it replaced is deleted from
 * the bucket only after the document has been written. Sending `removeAvatar`
 * or `removeCover` clears that slot without a replacement.
 */
router.patch(
  '/photos',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const files = req.files || {};
    const avatarFile = firstFile(files, 'avatar');
    const coverFile = firstFile(files, 'cover');
    const { removeAvatar, removeCover } = req.body || {};

    const touchingAvatar = !!avatarFile || isFlag(removeAvatar);
    const touchingCover = !!coverFile || isFlag(removeCover);
    if (!touchingAvatar && !touchingCover) {
      throw ApiError.badRequest('empty_patch', 'Send a photo, or say which one to remove');
    }

    const user = req.user;
    const avatarChange = await applySlot(user, 'avatar', avatarFile, removeAvatar);
    const coverChange = await applySlot(user, 'cover', coverFile, removeCover);

    try {
      await user.save();
    } catch (error) {
      // The replacements are not referenced by anything, so they go back out.
      if (avatarChange.uploadedKey) await filebase.deleteObject(avatarChange.uploadedKey);
      if (coverChange.uploadedKey) await filebase.deleteObject(coverChange.uploadedKey);
      throw error;
    }

    // Only now that the database no longer points at them.
    if (avatarChange.supersededKey) await filebase.deleteObject(avatarChange.supersededKey);
    if (coverChange.supersededKey) await filebase.deleteObject(coverChange.supersededKey);

    res.json({ user: await presentUser(user) });
  })
);

module.exports = router;

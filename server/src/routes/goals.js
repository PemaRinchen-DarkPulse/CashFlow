const express = require('express');
const multer = require('multer');

const Goal = require('../models/Goal');
const filebase = require('../services/filebase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requireString } = require('../utils/validate');

const router = express.Router();

/** Enough for anyone saving with intent, low enough to bound one user. */
const MAX_GOALS = 50;
const MAX_NAME_LENGTH = 60;
/** A goal nobody is entering by hand, and a guard on absurd input. */
const MAX_AMOUNT = 1_000_000_000;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
/** The shape the app generates: a prefix, a timestamp and a little randomness. */
const CLIENT_ID = /^[A-Za-z0-9_-]{1,40}$/;
const ICON = /^[a-z0-9-]{1,40}$/;

/**
 * Files are held in memory rather than spooled to disk: they go straight back
 * out to Filebase, so writing them to the server's own filesystem would only
 * add a temp file to clean up. The size cap is enforced here as well as in the
 * service, so an oversized body is refused before it is fully read.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: filebase.MAX_BYTES, files: 1 },
});

/**
 * The shape a goal leaves the API in.
 *
 * The `image` field is swapped for a freshly signed link. What is stored is the
 * object's own URL, which is stable but private — fetching it without the
 * account's keys answers 403, and the phone has no keys. Signing on read means
 * the link is always current, the bucket stays closed to the public, and the
 * database keeps holding a permanent address rather than an expiring one.
 */
async function present(goal) {
  const shape = goal.toPublic();
  if (!goal.image?.key) return shape;
  return { ...shape, image: (await filebase.signedUrl(goal.image.key)) || undefined };
}

function makeGoalId() {
  return `goal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function requireGoalName(value) {
  const name = requireString(value, 'name', 'Name what you are saving for');
  if (name.length > MAX_NAME_LENGTH) {
    throw ApiError.badRequest('invalid_name', 'That goal name is too long');
  }
  return name;
}

/** Money is stored to the cent. A target of nothing is never a real goal. */
function requireTarget(value) {
  const target = Number(value);
  if (!Number.isFinite(target) || target <= 0) {
    throw ApiError.badRequest('invalid_target', 'Enter a target greater than zero');
  }
  if (target > MAX_AMOUNT) {
    throw ApiError.badRequest('invalid_target', 'That target is too large');
  }
  return Math.round(target * 100) / 100;
}

function readSaved(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const saved = Number(value);
  if (!Number.isFinite(saved) || saved < 0) {
    throw ApiError.badRequest('invalid_saved', 'Enter a valid amount saved');
  }
  return Math.round(saved * 100) / 100;
}

function requireDeadline(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw ApiError.badRequest('invalid_deadline', 'Pick a valid target date');
  }
  return date;
}

function readIcon(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string' || !ICON.test(value)) {
    throw ApiError.badRequest('invalid_icon', 'Pick a valid icon');
  }
  return value;
}

function readColor(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string' || !HEX_COLOR.test(value)) {
    throw ApiError.badRequest('invalid_color', 'Pick a valid colour');
  }
  return value;
}

/**
 * `saved` is capped at `target` rather than refused above it. Contributing the
 * last of a goal is a normal thing to do slightly too much of, and a rejected
 * write there would lose the contribution entirely.
 */
function capSaved(saved, target) {
  return Math.min(saved, target);
}

/** GET /api/goals — this user's goals, soonest deadline first. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const goals = await Goal.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json({ goals: await Promise.all(goals.map(present)) });
  })
);

/** GET /api/goals/:id — one goal, if it is this user's. */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const goal = await Goal.findOne({ userId: req.user._id, id: req.params.id });
    if (!goal) throw ApiError.notFound('goal_not_found', 'That goal no longer exists');
    res.json({ goal: await present(goal) });
  })
);

/**
 * POST /api/goals — create a goal, with its picture in the same request.
 *
 * Accepts JSON or multipart. `upload.single` ignores a request that is not
 * multipart, so a client with no picture to send does not have to pretend it
 * has one, and a client with one does not need a second round trip.
 *
 * As with accounts and income, re-sending a stored `id` returns what is stored
 * rather than erroring, so a retry after a dropped connection cannot create the
 * same goal twice.
 */
router.post(
  '/',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { id, name, target, saved, deadline, icon, color } = req.body || {};

    const goalName = requireGoalName(name);
    const goalTarget = requireTarget(target);

    if (id !== undefined && id !== null && id !== '') {
      if (typeof id !== 'string' || !CLIENT_ID.test(id)) {
        throw ApiError.badRequest('invalid_id', 'That goal id is not valid');
      }
      const existing = await Goal.findOne({ userId: req.user._id, id });
      if (existing) return res.json({ goal: await present(existing) });
    }

    const count = await Goal.countDocuments({ userId: req.user._id });
    if (count >= MAX_GOALS) {
      throw ApiError.conflict('too_many_goals', `You can keep up to ${MAX_GOALS} goals`);
    }

    const goalId = id || makeGoalId();

    // Uploaded before the document is written, so a goal is never saved
    // pointing at a picture that failed to store.
    const image = req.file
      ? await filebase.uploadGoalImage({
          userId: req.user._id.toString(),
          goalId,
          file: req.file,
        })
      : null;

    try {
      const goal = await Goal.create({
        userId: req.user._id,
        id: goalId,
        name: goalName,
        target: goalTarget,
        saved: capSaved(readSaved(saved), goalTarget),
        deadline: requireDeadline(deadline),
        icon: readIcon(icon, 'flag'),
        color: readColor(color, '#1DD75B'),
        image,
      });
      res.status(201).json({ goal: await present(goal) });
    } catch (error) {
      // The write failed, so nothing points at the object that was just put in
      // the bucket. Take it back out rather than leaving it orphaned there.
      if (image) await filebase.deleteObject(image.key);
      throw error;
    }
  })
);

/**
 * PATCH /api/goals/:id — change a goal. Every field is optional.
 *
 * Sending a new file replaces the picture, and the one it replaced is deleted
 * from the bucket. Sending `removeImage=true` clears it without supplying a
 * replacement.
 */
router.patch(
  '/:id',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const goal = await Goal.findOne({ userId: req.user._id, id: req.params.id });
    if (!goal) throw ApiError.notFound('goal_not_found', 'That goal no longer exists');

    const { name, target, saved, deadline, icon, color, removeImage } = req.body || {};

    if (name !== undefined) goal.name = requireGoalName(name);
    if (target !== undefined) goal.target = requireTarget(target);
    if (deadline !== undefined) goal.deadline = requireDeadline(deadline);
    if (icon !== undefined) goal.icon = readIcon(icon, goal.icon);
    if (color !== undefined) goal.color = readColor(color, goal.color);
    if (saved !== undefined) goal.saved = readSaved(saved, goal.saved);

    // Applied after both, so raising `saved` and lowering `target` in one
    // request still lands on a consistent pair.
    goal.saved = capSaved(goal.saved, goal.target);

    /** The object to remove once the document has been written, if any. */
    let supersededKey = null;

    if (req.file) {
      const image = await filebase.uploadGoalImage({
        userId: req.user._id.toString(),
        goalId: goal.id,
        file: req.file,
      });
      supersededKey = goal.image?.key || null;
      goal.image = image;
    } else if (removeImage === true || removeImage === 'true') {
      supersededKey = goal.image?.key || null;
      goal.image = null;
    }

    try {
      await goal.save();
    } catch (error) {
      // The replacement is not referenced by anything, so it goes back out.
      if (req.file && goal.image) await filebase.deleteObject(goal.image.key);
      throw error;
    }

    // Only now that the database no longer points at it.
    if (supersededKey) await filebase.deleteObject(supersededKey);

    res.json({ goal: await present(goal) });
  })
);

/**
 * DELETE /api/goals/:id — remove a goal and the picture that belonged to it.
 *
 * The document goes first. If the object delete fails the goal is still gone,
 * which is what was asked for; the alternative leaves the user staring at a
 * goal they deleted because a storage call timed out.
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const goal = await Goal.findOneAndDelete({ userId: req.user._id, id: req.params.id });
    if (!goal) throw ApiError.notFound('goal_not_found', 'That goal no longer exists');

    await filebase.deleteObject(goal.image?.key);
    res.status(204).end();
  })
);

module.exports = router;

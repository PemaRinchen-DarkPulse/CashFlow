const mongoose = require('mongoose');

/**
 * What a new account starts with.
 *
 * These are the values the app used to hard-code in its own seed, kept
 * identical on purpose: moving preferences to the server changes where they are
 * remembered, not what a first run looks like.
 */
const DEFAULT_PREFERENCES = Object.freeze({
  currency: 'Nu.',
  hideBalance: true,
  budgetAlerts: true,
  goalReminders: true,
  weeklyDigest: true,
});

/**
 * How the app is set up to behave, embedded rather than given a collection of
 * its own.
 *
 * Every other resource here is a list a user has many of, each row carrying the
 * client id the phone knows it by. Preferences are the opposite: exactly one per
 * account, with nothing to look them up by but the user. A collection would add
 * a second read to serve them and a row that could go missing, where a
 * subdocument arrives already loaded on the user `requireAuth` fetches for
 * every request.
 */
const preferencesSchema = new mongoose.Schema(
  {
    /** Shown beside every amount — `Nu.`, `$`, `INR`. A symbol, not a locale. */
    currency: {
      type: String,
      trim: true,
      maxlength: 8,
      default: DEFAULT_PREFERENCES.currency,
    },
    /** Masks amounts across the app until the eye on the balance card is tapped. */
    hideBalance: { type: Boolean, default: DEFAULT_PREFERENCES.hideBalance },
    /** Warn at 80% of a category limit. */
    budgetAlerts: { type: Boolean, default: DEFAULT_PREFERENCES.budgetAlerts },
    /** Nudge to contribute to a savings goal each month. */
    goalReminders: { type: Boolean, default: DEFAULT_PREFERENCES.goalReminders },
    /** A Sunday summary of the week. */
    weeklyDigest: { type: Boolean, default: DEFAULT_PREFERENCES.weeklyDigest },
  },
  { _id: false }
);

/**
 * What the database remembers about a picture that lives in Filebase.
 *
 * The bytes are never stored here. Same record a goal carries: enough to show,
 * replace and delete the object, so loading the account is a cheap query that
 * happens to mention URLs rather than a transfer of the photos themselves.
 */
const imageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    url: { type: String, required: true },
    cid: { type: String, default: '' },
    size: { type: Number, default: 0 },
    contentType: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    /**
     * A user only ever reaches this collection through a verified code, so this
     * is always set — it is kept as a date because "when" is worth auditing.
     */
    emailVerifiedAt: { type: Date, required: true },
    /**
     * Not required: accounts registered before this existed have no
     * subdocument at all, which the serialiser below reads as "all defaults"
     * rather than as a user whose preferences cannot be determined.
     */
    preferences: { type: preferencesSchema, default: () => ({}) },
    /**
     * Profile pictures live in Filebase, not here. These hold the small record
     * needed to show, replace and delete them — the same shape a goal uses —
     * so loading the account never pulls the bytes through Mongo.
     */
    avatar: { type: imageSchema, default: null },
    cover: { type: imageSchema, default: null },
  },
  { timestamps: true }
);

/** The only shape of a user that is allowed out over the wire. */
userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
  };
};

/**
 * The preferences, with every key present.
 *
 * The app swaps its whole settings object for this, so a partial answer would
 * leave a toggle `undefined` and a switch rendering neither on nor off. Missing
 * keys therefore come back as their defaults instead of being left out.
 */
userSchema.methods.toPublicPreferences = function toPublicPreferences() {
  const stored = this.preferences ? this.preferences.toObject() : {};
  return { ...DEFAULT_PREFERENCES, ...stored };
};

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');

/**
 * What the database remembers about a picture that lives in Filebase.
 *
 * The bytes are never stored here. This is the small record needed to show the
 * image, replace it and delete it — so loading a user's goals is a cheap query
 * that happens to carry URLs, not a transfer of every photo they have picked.
 */
const imageSchema = new mongoose.Schema(
  {
    /** Object key in the bucket — the handle for replacing and deleting. */
    key: { type: String, required: true },
    /** Where the object can be fetched from. */
    url: { type: String, required: true },
    /**
     * Filebase pins uploads to IPFS and reports the content id. It addresses
     * the bytes rather than a location, so it survives the object being moved
     * or served from another gateway.
     */
    cid: { type: String, default: '' },
    size: { type: Number, default: 0 },
    contentType: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * A savings goal, in its own collection and always owned by one user.
 */
const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** The client-facing id, as with accounts and income. */
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    target: { type: Number, required: true },
    saved: { type: Number, required: true, default: 0 },
    deadline: { type: Date, required: true },
    /** Shown when there is no picture. */
    icon: { type: String, default: 'flag' },
    color: { type: String, default: '#1DD75B' },
    /** Absent until a picture is uploaded. */
    image: { type: imageSchema, default: null },
  },
  { timestamps: true }
);

// Unique per user, not globally — two people can each hold a "goal-laptop".
goalSchema.index({ userId: 1, id: 1 }, { unique: true });

// The listing below is "this user's goals, soonest deadline first".
goalSchema.index({ userId: 1, deadline: 1 });

goalSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    name: this.name,
    target: this.target,
    saved: this.saved,
    deadline: this.deadline.toISOString(),
    icon: this.icon,
    color: this.color,
    // Flattened to the one field the app draws with, with the rest of the
    // record alongside it for anything that needs to manage the file.
    image: this.image?.url || undefined,
    imageMeta: this.image
      ? {
          key: this.image.key,
          cid: this.image.cid,
          size: this.image.size,
          contentType: this.image.contentType,
          uploadedAt: this.image.uploadedAt?.toISOString(),
        }
      : undefined,
  };
};

module.exports = mongoose.model('Goal', goalSchema);

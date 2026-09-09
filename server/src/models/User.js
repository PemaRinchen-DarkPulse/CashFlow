const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);

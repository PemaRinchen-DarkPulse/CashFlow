const mongoose = require('mongoose');

/**
 * One outstanding sign-up challenge per email address. The name given at step
 * one rides along here rather than creating a half-built User: nothing lands in
 * the users collection until the code is confirmed and a password is set.
 */
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    /** bcrypt of the code — the plaintext is emailed and never stored. */
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    /** Drives the resend cooldown. */
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Mongo sweeps the document the moment `expiresAt` passes, so an abandoned
// challenge cleans itself up without a job.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);

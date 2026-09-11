const mongoose = require('mongoose');

/**
 * Money borrowed from, or lent to, somebody — a liability rather than a
 * transaction. It moves cash through an account but is never earning or
 * spending, so it stays out of every budget and analytics figure and lives in
 * its own collection rather than in the ledger.
 */
const debtSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** The client-facing id, as with accounts, goals and income. */
    id: { type: String, required: true },
    /** Who the money is with. No contact details — the app never asks for any. */
    person: { type: String, required: true, trim: true },
    /** `borrowed` = the user owes them. `lent` = they owe the user. */
    direction: { type: String, required: true, enum: ['borrowed', 'lent'] },
    /** The original amount, left alone as repayments come in. */
    principal: { type: Number, required: true },
    /** How much has been settled so far; never more than `principal`. */
    repaid: { type: Number, required: true, default: 0 },
    date: { type: Date, required: true },
    note: { type: String, trim: true, default: '' },
    /**
     * The account the cash moved through. Stored as the client-facing `id`
     * string Account carries rather than an ObjectId, so the phone can file a
     * debt against an account it already holds without resolving a server key.
     * Every write checks the account exists and belongs to the same user.
     */
    accountId: { type: String, required: true },
  },
  { timestamps: true }
);

// Unique per user, not globally — two people can each hold a `debt-…` the app
// numbered the same way.
debtSchema.index({ userId: 1, id: 1 }, { unique: true });

// The listing below is always "this user's debts, newest first", so the sort is
// served by the index rather than done in memory.
debtSchema.index({ userId: 1, date: -1 });

debtSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    person: this.person,
    direction: this.direction,
    principal: this.principal,
    repaid: this.repaid,
    // ISO, to match the string the app's Debt type already carries.
    date: this.date.toISOString(),
    note: this.note || undefined,
    accountId: this.accountId,
  };
};

module.exports = mongoose.model('Debt', debtSchema);

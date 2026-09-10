const mongoose = require('mongoose');

/**
 * Money coming in, kept in its own `incomes` collection rather than a shared
 * ledger table. Income is read on its own far more often than it is read
 * beside spending — the home screen, analytics and the savings-rate badge all
 * want just this side of the picture — and keeping it separate means those
 * reads never scan a collection dominated by expenses.
 */
const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    /**
     * The account this landed in. Stored as the client-facing `id` string that
     * Account carries, not as an ObjectId, so the phone can file income against
     * an account it already holds without first resolving a server key. Every
     * write checks the account exists and belongs to the same user.
     */
    accountId: { type: String, required: true },
    categoryId: { type: String, required: true },
    /** Always positive — this collection only ever holds money arriving. */
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Unique per user, not globally: two people can each hold an income the app
// numbered `inc-…` the same way, and the id only ever has to be resolvable
// within the one account that owns it.
incomeSchema.index({ userId: 1, id: 1 }, { unique: true });

// The listing below is always "this user's income, newest first", so the sort
// is served by the index rather than done in memory.
incomeSchema.index({ userId: 1, date: -1 });

incomeSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    title: this.title,
    accountId: this.accountId,
    categoryId: this.categoryId,
    amount: this.amount,
    // ISO, to match the string the app's Transaction type already carries.
    date: this.date.toISOString(),
    note: this.note || undefined,
    // Fixed rather than stored: everything in this collection is income, and a
    // column that can only hold one value is a column that can drift from it.
    kind: 'income',
  };
};

module.exports = mongoose.model('Income', incomeSchema);

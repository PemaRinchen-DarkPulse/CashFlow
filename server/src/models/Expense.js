const mongoose = require('mongoose');

/**
 * Money going out, kept in its own `expenses` collection rather than a shared
 * ledger table.
 *
 * Income already lives apart for the same reason: the home screen's "earned
 * this month" never has to scan a collection dominated by spending, and this
 * side never has to scan paydays. A single `transactions` table would make
 * those two reads share an index they do not share a filter with.
 *
 * Amounts are always positive. Direction is the collection, not a column —
 * a `kind` field that can only hold `'expense'` is a field that can drift.
 */
const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    /**
     * The account this left. Stored as the client-facing `id` string Account
     * carries, not as an ObjectId, so the phone can file spending against an
     * account it already holds without first resolving a server key. Every
     * write checks the account exists and belongs to the same user.
     */
    accountId: { type: String, required: true },
    categoryId: { type: String, required: true },
    /** Always positive — this collection only ever holds money leaving. */
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Unique per user, not globally: two people can each hold an expense the app
// numbered `txn-…` the same way, and the id only ever has to be resolvable
// within the one account that owns it.
expenseSchema.index({ userId: 1, id: 1 }, { unique: true });

// The listing below is always "this user's spending, newest first", so the sort
// is served by the index rather than done in memory.
expenseSchema.index({ userId: 1, date: -1 });

expenseSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    title: this.title,
    accountId: this.accountId,
    categoryId: this.categoryId,
    amount: this.amount,
    // ISO, to match the string the app's Transaction type already carries.
    date: this.date.toISOString(),
    note: this.note || undefined,
    kind: 'expense',
  };
};

module.exports = mongoose.model('Expense', expenseSchema);

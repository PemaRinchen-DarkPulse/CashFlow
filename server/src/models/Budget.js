const mongoose = require('mongoose');

/**
 * A monthly spending cap on one expense category.
 *
 * Spent is never stored here. The phone derives it from this month's expenses,
 * so a budget row that also held a running total would drift from the ledger
 * the moment a write landed on one collection and not the other. The only
 * number this document is allowed to remember is the limit the user set.
 */
const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** The client-facing id, as with accounts, goals and debts. */
    id: { type: String, required: true },
    /** An expense category id from the app's fixed list — never an income one. */
    categoryId: { type: String, required: true },
    /** Monthly cap in the app currency. Always positive, stored to the cent. */
    limit: { type: Number, required: true },
  },
  { timestamps: true }
);

// Unique per user, not globally — two people can each hold a `bud-…` the app
// numbered the same way.
budgetSchema.index({ userId: 1, id: 1 }, { unique: true });

// One monthly cap per category per person. A second row for Food would mean
// two numbers on the same progress bar, which is a contradiction rather than
// a feature.
budgetSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

budgetSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    categoryId: this.categoryId,
    limit: this.limit,
  };
};

module.exports = mongoose.model('Budget', budgetSchema);

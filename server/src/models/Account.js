const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    // No account or card number is stored. The app never asks for one, so there
    // is nothing here to leak, and nothing to have to protect.
    balance: { type: Number, required: true, default: 0 },
    color: { type: String, default: '#4DA3FF' },
    icon: { type: String, default: 'wallet' },
  },
  { timestamps: true }
);

// The client-facing `id` is what transactions, goals and debts on the phone
// point at, so it has to stay unique per user — but only per user, since two
// people can both hold an account the app calls "acc-everyday".
accountSchema.index({ userId: 1, id: 1 }, { unique: true });

accountSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    name: this.name,
    balance: this.balance,
    color: this.color,
    icon: this.icon,
  };
};

module.exports = mongoose.model('Account', accountSchema);

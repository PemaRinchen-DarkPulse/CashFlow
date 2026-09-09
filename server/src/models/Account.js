const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    last4: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
    color: { type: String, default: '#4DA3FF' },
    icon: { type: String, default: 'wallet' },
  },
  { timestamps: true }
);

accountSchema.methods.toPublic = function toPublic() {
  return {
    id: this.id,
    name: this.name,
    last4: this.last4,
    balance: this.balance,
    color: this.color,
    icon: this.icon,
  };
};

module.exports = mongoose.model('Account', accountSchema);


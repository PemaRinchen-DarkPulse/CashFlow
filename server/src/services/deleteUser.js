const Account = require('../models/Account');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const Income = require('../models/Income');
const Otp = require('../models/Otp');
const filebase = require('./filebase');

/**
 * Wipe one account and everything it owns.
 *
 * The database rows go first so a storage hiccup cannot leave a signed-in user
 * whose ledger is already gone. Pictures are then dropped best-effort — the
 * same rule as deleting a single goal: a file already missing is the state we
 * wanted, and a bucket outage must not resurrect the account.
 */
async function deleteUserAccount(user) {
  const goals = await Goal.find({ userId: user._id }).select('image.key');
  const keys = [user.avatar?.key, user.cover?.key, ...goals.map((goal) => goal.image?.key)].filter(
    Boolean
  );

  await Promise.all([
    Account.deleteMany({ userId: user._id }),
    Budget.deleteMany({ userId: user._id }),
    Debt.deleteMany({ userId: user._id }),
    Expense.deleteMany({ userId: user._id }),
    Goal.deleteMany({ userId: user._id }),
    Income.deleteMany({ userId: user._id }),
    Otp.deleteOne({ email: user.email }),
    user.deleteOne(),
  ]);

  await Promise.all(keys.map((key) => filebase.deleteObject(key)));
}

module.exports = { deleteUserAccount };

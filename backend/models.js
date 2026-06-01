const mongoose = require('mongoose');

// 1. Budget Target Schema
const BudgetSchema = new mongoose.Schema({
    month: { type: String, required: true }, // Format: "2026-05"
    targetLimit: { type: Number, required: true },
    isExceeded: { type: Boolean, default: false }
});

// 2. Expense Schema
const ExpenseSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Budget = mongoose.model('Budget', BudgetSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// 3. 🧠 The Budget Alert Algorithm
async function checkBudgetAlert(monthStr) {
    const budget = await Budget.findOne({ month: monthStr });
    if (!budget) return { alert: false, message: "No target budget set for this month yet." };

    const startOfMonth = new Date(`${monthStr}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

    const totalSpentResult = await Expense.aggregate([
        {
            $match: {
                date: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" }
            }
        }
    ]);

    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

    if (totalSpent > budget.targetLimit) {
        budget.isExceeded = true;
        await budget.save();
        return {
            alert: true,
            triggerPopup: true,
            message: `🚨 ALGORITHM ALERT: You have crossed your monthly target of ₹${budget.targetLimit}! Total spent: ₹${totalSpent}`
        };
    }

    return {
        alert: false,
        triggerPopup: false,
        message: `Safe! Total spent: ₹${totalSpent} out of ₹${budget.targetLimit}`
    };
}

module.exports = { Budget, Expense, checkBudgetAlert };
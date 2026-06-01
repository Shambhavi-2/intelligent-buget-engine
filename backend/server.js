const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Core Node.js module for path operations
require('dotenv').config();

const { Budget, Expense, checkBudgetAlert } = require('./models');

const app = express();

// 1. Dynamic CORS Configuration
// Allows your API to be flexible while keeping it secure
app.use(cors());
app.use(express.json());

// 2. Serve Static Frontend Assets Natively
// This allows you to host BOTH backend and frontend together on a single server!
app.use(express.static(path.join(__dirname, '../frontend')));

// --- API ROUTES ---

// ROUTE 1: Set Target Limit
app.post('/api/budget', async (req, res) => {
    try {
        const { month, targetLimit } = req.body;
        const budget = await Budget.findOneAndUpdate(
            { month },
            { targetLimit, isExceeded: false },
            { upsert: true, new: true }
        );
        res.json({ message: "🎯 Target budget set successfully!", budget });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE 2: Add Expense & Trigger Pop-up
app.post('/api/expense', async (req, res) => {
    try {
        const { productName, amount, category, date } = req.body;
        const newExpense = new Expense({ productName, amount, category, date });
        await newExpense.save();

        const expenseDate = date ? new Date(date) : new Date();
        const monthStr = expenseDate.toISOString().slice(0, 7);

        const alertStatus = await checkBudgetAlert(monthStr);

        res.json({
            message: "💰 Expense recorded successfully!",
            expense: newExpense,
            alertData: alertStatus
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE 3: Get History/Analytics
app.get('/api/analytics', async (req, res) => {
    try {
        const analytics = await Expense.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    totalSpent: { $sum: "$amount" },
                    products: { $push: { id: "$_id", name: "$productName", amount: "$amount", category: "$category" } }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(analytics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE 4: Update/Edit Expense
app.put('/api/expense/:id', async (req, res) => {
    try {
        const { productName, amount, category } = req.body;
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { productName, amount, category },
            { new: true }
        );
        const expenseDate = updatedExpense.date || new Date();
        const monthStr = expenseDate.toISOString().slice(0, 7);
        const alertStatus = await checkBudgetAlert(monthStr);

        res.json({ message: "📝 Expense entry altered smoothly!", expense: updatedExpense, alertData: alertStatus });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ROUTE 5: Delete Expense
app.delete('/api/expense/:id', async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "🗑️ Expense removed from ledger storage successfully!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Fallback Route to serve index.html for any undeclared endpoints
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 4. Production Environment Shims
// Process.env.PORT allows live hosting platforms (Render/Heroku) to inject their own port dynamically
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/budget_tracker';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Network System!');
        app.listen(PORT, () => console.log(`🚀 Production Engine spinning on port ${PORT}`));
    })
    .catch(err => console.log('❌ Database Connection Failure: ', err));
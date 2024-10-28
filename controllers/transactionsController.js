const Transactions = require("../models/transactions");

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transactions.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving transactions");
    }
};

const getTransactionsByAccountId = async (req, res) => {
    const accountId = req.params.accountId;
    try {
        const transactions = await Transactions.getTransactionsByAccountId(accountId);
        if (transactions.length === 0) {
            return res.status(404).send("No transactions found for this account");
        }
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving transactions by account ID");
    }
};

const createTransaction = async (req, res) => {
    const { FromAccountID, ToAccountID, Amount, Description } = req.body;

    // Validation
    if (!FromAccountID || !ToAccountID || !Amount) {
        return res.status(400).send("Missing required fields");
    }
    const parsedAmount = parseFloat(Amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).send("Invalid amount value");
    }

    try {
        const status = await Transactions.createTransaction(FromAccountID, ToAccountID, parsedAmount, Description);
        res.status(201).json({ message: `Transaction ${status}`, status: status });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating transaction");
    }
};

module.exports = {
    getAllTransactions,
    getTransactionsByAccountId,
    createTransaction
};

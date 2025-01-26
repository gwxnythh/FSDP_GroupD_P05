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
/*
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
*/

const getTransactionsByAccountId = async (req, res) => {
    const accountId = req.params.accountId;
    try {
        const transactions = await Transactions.getTransactionsByAccountId(accountId);
        console.log("Fetched Transactions:", transactions); // Debug log
        res.json(transactions);
    } catch (error) {
        console.error("Error retrieving transactions by account ID:", error);
        res.status(500).send("Error retrieving transactions");
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

    console.log('create transaction: ', req.body)

    try {
        const status = await Transactions.createTransaction(FromAccountID, ToAccountID, parsedAmount, Description);
        res.status(201).json(status);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating transaction");
    }
};

const summarizeTransaction = async (req, res) => {
    const { TransferType, TransferTo, FromAccountID, FromAccountTextContent, Amount, Description } = req.body;
    // Validation
    if (!TransferType || !FromAccountID || !TransferTo || !Amount) {
        return res.status(400).send("Missing required fields");
    }
    const parsedAmount = parseFloat(Amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).send("Invalid amount value");
    }

    try {
        res.status(204).json({});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating transaction");
    }
};


module.exports = {
    getAllTransactions,
    getTransactionsByAccountId,
    createTransaction,
    summarizeTransaction
};
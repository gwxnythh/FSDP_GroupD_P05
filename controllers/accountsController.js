// controllers/accountsController.js
const Accounts = require("../models/accounts");

const getAccountById = async (req, res) => {
    const id = req.params.id;
    try {
        const account = await Accounts.getAccountById(id);
        if (!account) {
            return res.status(404).send("Account not found");
        }
        res.json(account);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving account");
    }
};

const getAccountByAccessCode = async (req, res) => {
    const accessCode = req.query.accessCode;
    try {
        const accounts = await Accounts.getAccountByAccessCode(accessCode);
        res.json(accounts);
    } catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateBalance = async (req, res) => {
    const AccountID = req.params.id;
    const { Balance } = req.body;
    const newBalance = parseFloat(Balance);

    if (isNaN(newBalance)) {
        return res.status(400).send("Invalid balance value");
    }

    try {
        const updatedAccount = await Accounts.updateBalance(AccountID, newBalance);
        if (!updatedAccount) {
            return res.status(404).send("Account not found");
        }
        res.json({ message: "Balance updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating balance");
    }
};

const getCurrentAccountByMobile = async (req, res) => {
    const { mobileNumber } = req.params;

    try {
        const account = await Accounts.getCurrentAccountByMobileNumber(mobileNumber);
        if (!account) {
            return res.status(404).json({ message: "No current account found for this mobile number." });
        }
        res.json(account);
    } catch (error) {
        console.error("Error fetching current account by mobile number:", error);
        res.status(500).json({ message: "Error fetching account" });
    }
};

module.exports = {
    getAccountById,
    getAccountByAccessCode,
    updateBalance,
    getCurrentAccountByMobile
};

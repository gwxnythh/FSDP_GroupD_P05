const Accounts = require("../models/accounts");
const bcrypt = require("bcryptjs");



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

const updateBalance = async (req, res) => {
    const AccountID = req.params.id;
    const { Balance } = req.body;  // Correctly destructure newBalance from request body

    const newBalance = parseFloat(Balance);

    // Validate that the new balance is a number
    if (isNaN(newBalance)) {
        return res.status(400).send("Invalid balance value");
    }

    try {
        const updatedAccount = await Accounts.updateBalance(AccountID, newBalance);  // Pass the correct newBalance to updateBalance
        if (!updatedAccount) {
            return res.status(404).send("Account not found");
        }
        res.json({ message: "Balance updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating balance");
    }
};



module.exports = {
    getAccountById,
    updateBalance
}
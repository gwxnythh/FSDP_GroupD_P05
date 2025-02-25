// controllers/accountsController.js
const { Transaction } = require("mssql");
const Accounts = require("../models/accounts");
const Transactions = require("../models/transactions");

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
        console.log("Fetched Accounts:", accounts); // Debug log
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

const getAccountBalance = async (req, res) => { 
    const accountId = req.params.id;
    console.log("Account ID:", accountId);

    try {
        const balance = await Accounts.getAccountBalance(accountId);

        if (balance === null) {
            return res.status(404).json({ message: 'No balance found' });
        }

        res.json({ balance });
    } catch (error) {
        console.error('Error in controller:', error);
        res.status(500).json({ message: 'Server error' });
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


const updatePoints = async (req, res) => {
    const AccountID = req.params.id;
    const { Points } = req.body;
    const newPoints = parseFloat(Points);

    if (isNaN(Points)) {
        return res.status(400).send("Invalid Points value");
    }

    try {
        const updatedAccount = await Accounts.updatePoints(AccountID, newPoints);
        if (!updatedAccount) {
            return res.status(404).send("Account not found");
        }
        res.json({ message: "Points updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating points");
    }
};

const getAccountPoints = async (req, res) => {
    const accountId = req.params.id;
    console.log("Received AccountID in request:", accountId); // Debug log

    try {
        const points = await Accounts.getAccountPoints(accountId);

        if (points === null) {
            console.log("No points found for AccountID:", accountId); // Debug log
            return res.status(404).json({ message: "No points found" });
        }

        console.log("Points found for AccountID:", accountId, "Points:", points); // Debug log
        res.json({ points });
    } catch (error) {
        console.error("Error in controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getAccountSpending = async (req, res) => {
    const userId = req.params.id;
    console.log("Retrieving spending for account:", userId); // Debug log

    try {
        const spending = await Transactions.getTransactionsSpendingByUserId(userId);

        if (spending === null) {
            console.log("No spending found for AccountID:", userId); // Debug log
            return res.status(404).json({ message: "No spending found" });
        }

        // console.log("Spending found for userId:", userId, "Spending:", spending); // Debug log
        const updatedSpendingData = addMissingMonths(spending);
        res.json({ updatedSpendingData });
    } catch (error) {
        console.error("Error in controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

function generateFullMonthsList() {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      months.push({
        Year: date.getFullYear(),
        Month: date.getMonth() + 1 
      });
    }
    
    return months.reverse();
  }
  
  function addMissingMonths(spending) {
    const fullMonthsList = generateFullMonthsList();
    const updatedSpending = [];
  
    fullMonthsList.forEach(month => {
      const found = spending.find(
        entry => entry.Year === month.Year && entry.Month === month.Month
      );
      
      if (found) {
        updatedSpending.push(found);
      } else {
        updatedSpending.push({
          Year: month.Year,
          Month: month.Month,
          TotalSpending: 0
        });
      }
    });
  
    return updatedSpending;
  }

/*
const getAccountPoints = async (req, res) => { 
    const accountId = req.params.id;
    console.log("Account ID:", accountId);

    try {
        const points = await Accounts.getAccountPoints(accountId);

        if (points === null) {
            return res.status(404).json({ message: 'No points found' });
        }

        res.json({ points });
    } catch (error) {
        console.error('Error in controller:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
*/
module.exports = {
    getAccountById,
    getAccountByAccessCode,
    updateBalance,
    getCurrentAccountByMobile,
    getAccountBalance,
    updatePoints,
    getAccountPoints,
    getAccountSpending
};

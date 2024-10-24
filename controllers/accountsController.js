const Accounts = require("../models/accounts");
const bcrypt = require("bcryptjs");

const getAllAccounts = async (req, res) => {
    try {
      const accounts = await Accounts.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving accounts");
    }
};


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



module.exports = {
    getAllAccounts,
    getAccountById,
    
}
// controllers/usersController.js
const Users = require("../models/users");

const login = async (req, res) => {
    const { accessCode, pin } = req.body; // Retrieve access code and PIN from the request body

    try {
        const result = await Users.login(accessCode, pin);

        if (result.length > 0) {
            // If user exists, send back account details
            res.status(200).json({
                message: 'Login successful',
                user: result[0].FullName,
                accounts: result.map(account => ({
                    accountNumber: account.AccountNumber,
                    balance: account.Balance,
                }))
            });
        } else {
            res.status(401).json({ message: 'Invalid Access Code or PIN' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { login };

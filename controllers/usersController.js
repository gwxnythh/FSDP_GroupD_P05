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

const getUserByMobile = async (req, res) => {
    const mobileNumber = req.query.mobile;

    try {
        const user = await Users.getUserByMobile(mobileNumber);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ ...user, fullName: user.FullName });
    } catch (error) {
        console.error("Error fetching user by mobile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserById = async (req, res) => {
    const id = req.query.id;

    try {
        const user = await Users.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user by id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { login, getUserByMobile, getUserById };

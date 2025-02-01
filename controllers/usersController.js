// controllers/usersController.js
const { user } = require("../dbConfig");
const Users = require("../models/users");

const login = async (req, res) => {
    const { accessCode, pin } = req.body;

    try {
        const result = await Users.login(accessCode, pin);
        console.log("Login result:", result);  // Debug log

        if (result.length > 0) {
            if (!result[0].Verified) {
                res.status(401).json({ message: 'Account is not verified' });
                return;
            }

            res.status(200).json({
                message: 'Login successful',
                user: result[0].FullName,
                accounts: result.map(account => ({
                    accountNumber: account.AccountNumber,
                    balance: account.Balance,
                    isHapticTouch: account.IsHapticTouch,
                    isVoiceOver: account.IsVoiceOver,
                    isVoiceRecognition: account.IsVoiceRecognition
                })),
            });
        } else {
            res.status(401).json({ message: 'Invalid Access Code or PIN' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const signUp = async (req, res) => {
    const userForm = req.body;

    try {
        const result = await Users.signUp(userForm);
        console.log("Signup result:", result);  // Debug log

        if (result) {
            res.status(200).json({
                message: 'Sign up successful',
                user: userForm.userId,
                fullname: userForm.fullname,
                accessCode: userForm.nric,
                isHapticTouch: userForm.isHapticTouch,
                isVoiceOver: userForm.isVoiceOver,
                isVoiceRecognition: userForm.isVoiceRecognition
            });
        } else {
            res.status(401).json({ message: 'Failed to sign up' });
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


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

const getUserPreference = async (req, res) => {
    const id = req.query.id;

    try {
        const userPref = await Users.getUserPreference(id);
        if (!userPref) {
            return res.status(404).json({ message: "User preference not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user by id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const setUserPreference = async (req, res) => {
    const { id, isHapticTouch, isVoiceOver, isVoiceRecognition } = req.body;

    try {
        await Users.setUserPreference(id, isHapticTouch, isVoiceOver, isVoiceRecognition);
        res.status(204).json({});
    } catch (error) {
        console.error("Error fetching user by id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const verifyToken = async (req, res) => {
    const { verificationToken } = req.params;

    try {
        const account = await Users.getAccountByVerificationToken(verificationToken);
        if (!account) {
            return res.status(404).json({ message: "No current account found for this mobile number." });
        }
        // res.json(account);
        Users.updateVerificationStatus(verificationToken);
        res.redirect('/login.html');
    } catch (error) {
        console.error("Error fetching current account by mobile number:", error);
        res.status(500).json({ message: "Error fetching account" });
    }
}


module.exports = { login, signUp, getUserByMobile, getUserById, getUserPreference, setUserPreference, verifyToken};

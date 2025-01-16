// models/users.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Users {
    constructor(UserID, FullName, AccessCode, PIN, IsActive) {
        this.UserID = UserID;
        this.FullName = FullName;
        this.AccessCode = AccessCode;
        this.PIN = PIN;
        this.IsActive = IsActive;
    }

    static async login(accessCode, pin) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `
            SELECT u.UserID, u.FullName, a.AccountNumber, a.Balance, ap.IsHapticTouch, ap.IsVoiceOver, ap.IsVoiceRecognition
            FROM Users u
            JOIN Accounts a ON u.UserID = a.UserID
            JOIN AccountPrefs ap ON a.UserID = ap.UserID
            WHERE u.AccessCode = @AccessCode AND u.PIN = @PIN AND u.IsActive = 1
        `;
        const request = connection.request();
        request.input("AccessCode", accessCode);
        request.input("PIN", pin);
        
        try {
            const result = await request.query(sqlQuery);
            return result.recordset; // Return result directly for login
        } finally {
            connection.close(); // Ensure connection is closed
        }
    }

    static async getUserByMobile(mobileNumber) {
        const connection = await sql.connect(dbConfig);
        // const query = `SELECT * FROM Users WHERE MobileNumber = @mobileNumber`;
        const query = `SELECT U.UserID, U.FullName, U.MobileNumber, A.AccountID, A.AccountNumber, A.AccountType, A.Balance, A.Currency, A.CreatedAt FROM Users U INNER JOIN Accounts A ON U.UserID = A.UserID WHERE U.MobileNumber = @mobileNumber;`
        const request = connection.request();
        request.input("mobileNumber", sql.VarChar, mobileNumber);

        try {
            const result = await request.query(query);
            return result.recordset[0]; // Return the first record
        } finally {
            connection.close(); // Ensure connection is closed
        }
    }

    static async getUserById(id) {
        const connection = await sql.connect(dbConfig);
        const query = `SELECT * FROM Users WHERE UserId = @id`;
        const request = connection.request();
        request.input("id", sql.VarChar, id);

        try {
            const result = await request.query(query);
            return result.recordset[0]; // Return the first record
        } finally {
            connection.close(); // Ensure connection is closed
        }
    }

    static async getUserPreference(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `
            SELECT *
            FROM AccountPrefs
            WHERE UserId = @UserId
        `;
        const request = connection.request();
        request.input("UserId", id);
        
        try {
            const result = await request.query(sqlQuery);
            return result.recordset; // Return result directly for login
        } finally {
            connection.close(); // Ensure connection is closed
        }
    }

    static async setUserPreference(id, isHapticTouch, isVoiceOver, isVoiceRecognition) {
        const connection = await sql.connect(dbConfig);
        console.log('set USER PREFERENCE: ', JSON.stringify(result))
        const sqlQuery = `
            UPDATE AccountPrefs SET IsHapticTouch = @IsHapticTouch, IsVoiceOver = @IsVoiceOver, IsVoiceRecognition = @IsVoiceRecognition WHERE UserId = @UserId;
        `;
        const request = connection.request();
        
        request.input("UserId", id);
        request.input("IsHapticTouch", isHapticTouch ? 1 : 0);
        request.input("IsVoiceOver", isVoiceOver ? 1 : 0);
        request.input("IsVoiceRecognition", isVoiceRecognition ? 1 : 0);
        
        try {
            const result = await request.query(sqlQuery);
            return result.recordset; // Return result directly for login
        } finally {
            connection.close(); // Ensure connection is closed
        }
    }

    static async signUp(userForm) {
        const userExist = await this.getUserByAccessCode(userForm.nric)
        if (userExist) {
            return null;
        }
        const connection = await sql.connect(dbConfig);

        try {
            // create account if doesn't exist, create user
            const userCreationQuery = `
                INSERT INTO Users (UserID, AccessCode, PIN, FullName, Email, MobileNumber)
                OUTPUT INSERTED.UserID
                VALUES 
                    ('U' + CAST(CAST((SELECT MAX(CAST(SUBSTRING(UserID, 2, LEN(UserID)) AS INT)) FROM Users) AS INT) + 1 AS NVARCHAR(10)), @AccessCode, @Pin, @Fullname, @Email, @MobileNumber);
            `;
            const userRequest = connection.request();
            userRequest.input("AccessCode", userForm.nric);
            userRequest.input("PIN", userForm.pin);
            userRequest.input("Fullname", userForm.fullname);
            userRequest.input("Email", userForm.email);
            userRequest.input("MobileNumber", userForm.mobileNumber);
            const userResult = await userRequest.query(userCreationQuery);
            
            // create account if doesn't exist, create user
            const accountCreationQuery = `
                INSERT INTO Accounts (AccountID, UserID, AccessCode, AccountNumber, AccountType, Balance, Currency) 
                VALUES 
                    ('A' + CAST(CAST((SELECT MAX(CAST(SUBSTRING(AccountID, 2, LEN(AccountID)) AS INT)) FROM Accounts) AS INT) + 1 AS NVARCHAR(10)), @UserId, @AccessCode, @AccountNumber, 'Savings', 2000.00, 'SGD');
            `;
            const accountRequest = connection.request();
            accountRequest.input("UserId", userResult.recordset[0].UserID);
            accountRequest.input("AccessCode", userForm.nric);
            accountRequest.input("AccountNumber", this.generateAccountNumber(userForm.nric));
            const accountResult = await accountRequest.query(accountCreationQuery);

            // create account if doesn't exist, create user
            const accountPrefCreationQuery = `
                INSERT INTO AccountPrefs (AccountPrefsId, UserID, IsHapticTouch, IsVoiceOver, IsVoiceRecognition) 
                VALUES 
                    ('P' + CAST(CAST(COALESCE((SELECT MAX(CAST(SUBSTRING(AccountPrefsId, 2, LEN(AccountPrefsId)) AS INT)) FROM AccountPrefs), 0) AS INT) + 1 AS NVARCHAR(10)), @UserId, @IsHapticTouch, @IsVoiceOver, @IsVoiceRecognition);
            `;
            const accountPrefRequest = connection.request();
            accountPrefRequest.input("UserId", userResult.recordset[0].UserID);
            accountPrefRequest.input("IsHapticTouch", userForm.isHapticTouch ? 1 : 0);
            accountPrefRequest.input("IsVoiceOver", userForm.isVoiceOver ? 1 : 0);
            accountPrefRequest.input("IsVoiceRecognition", userForm.isVoiceRecognition ? 1 : 0);
            const accountPrefResult = await accountPrefRequest.query(accountPrefCreationQuery);

            // await this.setUserPreference(userResult.UserID, userForm.isHapticTouch, userForm.isVoiceOver, userForm.isVoiceRecognition)

            return userResult;
        } finally {
            connection.close(); // Ensure connection is closed
        }
    }

    static removeAlphaAndTruncate(input) {
        // Remove all alphabetic characters
        const numericPart = input.replace(/[a-zA-Z]/g, '');
        
        // Truncate to 7 digits
        const truncated = numericPart.slice(0, 7);
        
        return truncated;
    }

    static generateAccountNumber(nric) {
        const prefix = '717';
        const middle = this.removeAlphaAndTruncate(nric);
        const suffix = Math.floor(Math.random() * 900) + 100;
      
        // Combine to form the account number
        return `${prefix}-${middle}-${suffix}`;
      }

    static async getUserByAccessCode(accessCode) {
        const connection = await sql.connect(dbConfig);
        const query = `SELECT * FROM Users WHERE AccessCode = @AccessCode;`
        const request = connection.request();
        request.input("AccessCode", accessCode);

        try {
            const result = await request.query(query);
            return result.recordset[0]; // Return the first record
        } finally {
            connection.close(); // Ensure connection is closed
        }
    }
}

module.exports = Users;

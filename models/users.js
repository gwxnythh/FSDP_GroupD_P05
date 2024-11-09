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
            SELECT u.UserID, u.FullName, a.AccountNumber, a.Balance
            FROM Users u
            JOIN Accounts a ON u.UserID = a.UserID
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
}

module.exports = Users;

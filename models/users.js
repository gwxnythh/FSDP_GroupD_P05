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
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset; // Return result directly for login
    }
}

module.exports = Users;

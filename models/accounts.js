// models/accounts.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Accounts {
    constructor(AccountID, UserID, AccessCode, AccountNumber, AccountType, Balance, Currency, CreatedAt) {
        this.AccountID = AccountID;
        this.UserID = UserID;
        this.AccessCode = AccessCode;
        this.AccountNumber = AccountNumber;
        this.AccountType = AccountType;
        this.Balance = Balance;
        this.Currency = Currency;
        this.CreatedAt = CreatedAt;
    }

    static async getAccountById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Accounts WHERE UserID = @id`;
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            row => new Accounts(row.AccountID, row.UserID, row.AccessCode, row.AccountNumber, row.AccountType, row.Balance, row.Currency, row.CreatedAt)
        );
    }

    static async getAccountByAccessCode(accessCode) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Accounts WHERE AccessCode = @AccessCode`;
        const request = connection.request();
        request.input("AccessCode", accessCode);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            row => new Accounts(row.AccountID, row.UserID, row.AccessCode, row.AccountNumber, row.AccountType, row.Balance, row.Currency, row.CreatedAt)
        );
    }

    static async updateBalance(AccountID, newBalance) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `UPDATE Accounts SET Balance = @Balance WHERE AccountID = @AccountID`;
        const request = connection.request();
        request.input("AccountID", AccountID);
        request.input("Balance", newBalance);
        const result = await request.query(sqlQuery);

        connection.close();

        return result.rowsAffected[0] > 0;
    }

    static async getCurrentAccountByMobileNumber(mobileNumber) {
        let connection;

        try {
            // Establish the database connection
            connection = await sql.connect(dbConfig);

            // Step 1: Get UserID from Users table using mobile number
            const userQuery = `SELECT UserID FROM Users WHERE MobileNumber = @mobileNumber`;
            const userRequest = connection.request();
            userRequest.input("mobileNumber", sql.Char(8), mobileNumber);

            const userResult = await userRequest.query(userQuery);
            if (userResult.recordset.length === 0) {
                // No user found with this mobile number
                return null;
            }
            const userID = userResult.recordset[0].UserID;

            // Step 2: Get the Current account from Accounts table using UserID
            const accountQuery = `
                SELECT * FROM Accounts
                WHERE UserID = @userID AND AccountType = 'Current'
            `;
            const accountRequest = connection.request();
            accountRequest.input("userID", sql.NVarChar, userID);

            const accountResult = await accountRequest.query(accountQuery);

            if (accountResult.recordset.length === 0) {
                // No Current account found for this user
                return null;
            }

            // Map result to Accounts object
            const account = accountResult.recordset[0];
            return new Accounts(
                account.AccountID,
                account.UserID,
                account.AccessCode,
                account.AccountNumber,
                account.AccountType,
                account.Balance,
                account.Currency,
                account.CreatedAt
            );

        } catch (error) {
            console.error("Error fetching current account by mobile number:", error);
            throw error;
        } finally {
            // Ensure the connection is closed after execution
            if (connection) {
                connection.close();
            }
        }
    }


}

module.exports = Accounts;

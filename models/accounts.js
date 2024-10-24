const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

class Accounts {
    constructor(AccountID, UserID, AccessCode, AccountNumber, AccountType, Balance, Currency, CreatedAt) {
        this.AccountID = AccountID
        this.UserID = UserID;
        this.AccessCode = AccessCode;
        this.AccountNumber = AccountNumber;
        this.AccountType = AccountType;
        this.Balance = Balance;
        this.Currency = Currency;
        this.CreatedAt = CreatedAt;
    }

    static async getAllAccounts() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Accounts`;

        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset.map(
            (row) => new Accounts(row.AccountID, row.UserID, row.AccessCode, row.AccountNumber, row.AccountType, row.Balance, row.Currency, row.CreatedAt)
        );
    }

    static async getAccountById(id) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Accounts WHERE UserID = @id`;

        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);

        connection.close();

        // Map the result set to an array of Account objects
        return result.recordset.map(
            row => new Accounts(
                row.AccountID,
                row.UserID,
                row.AccessCode,
                row.AccountNumber,
                row.AccountType,
                row.Balance,
                row.Currency,
                row.CreatedAt
            )
        );
    }

    
}


module.exports = Accounts;

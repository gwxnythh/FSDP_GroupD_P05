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
}

module.exports = Accounts;

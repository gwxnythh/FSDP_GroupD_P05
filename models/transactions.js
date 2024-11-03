const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Transactions {
    constructor(TransactionID, FromAccountID, ToAccountID, Amount, TransactionDate, Status, Description, ReferenceNo) {
        this.TransactionID = TransactionID;
        this.FromAccountID = FromAccountID;
        this.ToAccountID = ToAccountID;
        this.Amount = Amount;
        this.TransactionDate = TransactionDate;
        this.Status = Status;
        this.Description = Description;
        this.ReferenceNo = ReferenceNo;
    }

    static async getAllTransactions() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Transactions`;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(
            (row) => new Transactions(
                row.TransactionID,
                row.FromAccountID,
                row.ToAccountID,
                row.Amount,
                row.TransactionDate,
                row.Status,
                row.Description
            )
        );
    }

    static async createTransaction(FromAccountID, ToAccountID, Amount, Description) {
        const connection = await sql.connect(dbConfig);
        //TransactionID
        const lastTransactionQuery = `SELECT TOP 1 CAST(SUBSTRING(TransactionID, 2, LEN(TransactionID)) AS INT) AS LastID FROM Transactions ORDER BY LastID DESC`;
        const lastTransactionResult = await connection.request().query(lastTransactionQuery);
        const lastTransactionID = lastTransactionResult.recordset[0] ? lastTransactionResult.recordset[0].LastID : 0;
        const newTransactionID = `T${lastTransactionID + 1}`;
        //ReferenceNo
        const lastReferenceQuery = `SELECT TOP 1 CAST(ReferenceNo AS INT) AS ReferenceNo FROM Transactions ORDER BY ReferenceNo DESC`;
        const lastReferenceResult = await connection.request().query(lastReferenceQuery);
        const lastReferenceNo = lastReferenceResult.recordset.length > 0 
        ? lastReferenceResult.recordset[0].ReferenceNo 
        : '0000000'; // Default if no reference found

        const newReferenceNo = (parseInt(lastReferenceNo) + 1).toString().padStart(7, '0');

        const getBalanceQuery = `SELECT AccountID, Balance FROM Accounts WHERE AccountID IN (@FromAccountID, @ToAccountID)`;
        const balanceRequest = connection.request();
        balanceRequest.input("FromAccountID", FromAccountID);
        balanceRequest.input("ToAccountID", ToAccountID);

        const balanceResult = await balanceRequest.query(getBalanceQuery);
        const accounts = Object.fromEntries(balanceResult.recordset.map(a => [a.AccountID, a.Balance]));

        const fromBalance = accounts[FromAccountID];


        let transactionStatus = 'Pending';

        if (fromBalance >= Amount) {
            transactionStatus = 'Completed';

            const updateBalanceQuery = `
                UPDATE Accounts SET Balance = Balance - @Amount WHERE AccountID = @FromAccountID;
                UPDATE Accounts SET Balance = Balance + @Amount WHERE AccountID = @ToAccountID;
            `;
            const updateBalanceRequest = connection.request();
            updateBalanceRequest.input("Amount", Amount);
            updateBalanceRequest.input("FromAccountID", FromAccountID);
            updateBalanceRequest.input("ToAccountID", ToAccountID);
            await updateBalanceRequest.query(updateBalanceQuery);
        } else {
            transactionStatus = 'Failed'; // Insufficient balance
        }

        const transactionQuery = `
            INSERT INTO Transactions (TransactionID, FromAccountID, ToAccountID, Amount, TransactionDate, Status, Description, ReferenceNo)
            VALUES (@TransactionID, @FromAccountID, @ToAccountID, @Amount, GETDATE(), @Status, @Description, @ReferenceNo);
        `;
        const transactionRequest = connection.request();
        transactionRequest.input("TransactionID", newTransactionID);
        transactionRequest.input("FromAccountID", FromAccountID);
        transactionRequest.input("ToAccountID", ToAccountID);
        transactionRequest.input("Amount", Amount);
        transactionRequest.input("Status", transactionStatus);
        transactionRequest.input("Description", Description);
        transactionRequest.input("ReferenceNo", newReferenceNo);

        await transactionRequest.query(transactionQuery);
        
        return transactionStatus;
        
        
    }


    static async getTransactionsByAccountId(accountId) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `
            SELECT * FROM Transactions 
            WHERE FromAccountID = @accountId OR ToAccountID = @accountId
        `;
        const request = connection.request();
        request.input("accountId", accountId);

        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(row => new Transactions(
            row.TransactionID,
            row.FromAccountID,
            row.ToAccountID,
            row.Amount,
            row.TransactionDate,
            row.Status,
            row.Description,
            row.ReferenceNo
        ));
    }
}

module.exports = Transactions;
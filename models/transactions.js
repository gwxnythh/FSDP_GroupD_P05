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

        try {
            console.log("Starting transaction creation...");

            // Generate Transaction ID
            const lastTransactionQuery = `
                SELECT TOP 1 CAST(SUBSTRING(TransactionID, 2, LEN(TransactionID)) AS INT) AS LastID 
                FROM Transactions 
                ORDER BY LastID DESC
            `;
            const lastTransactionResult = await connection.request().query(lastTransactionQuery);
            const lastTransactionID = lastTransactionResult.recordset[0]?.LastID || 0;
            const newTransactionID = `T${lastTransactionID + 1}`;
            console.log("Generated Transaction ID:", newTransactionID);

            // Generate Reference Number
            const newReferenceNo = (Math.random() * 10000000).toFixed(0).padStart(7, '0');
            console.log("Generated Reference Number:", newReferenceNo);

            // Check balance for sufficient funds
            const getBalanceQuery = `
                SELECT Balance 
                FROM Accounts 
                WHERE AccountID = @FromAccountID
            `;
            const balanceRequest = connection.request();
            balanceRequest.input("FromAccountID", FromAccountID);

            const balanceResult = await balanceRequest.query(getBalanceQuery);
            const fromBalance = balanceResult.recordset[0]?.Balance || 0;
            console.log("Available Balance:", fromBalance);

            let transactionStatus = 'Pending';
            if (fromBalance >= Amount) {
                transactionStatus = 'Completed';

                // Deduct amount from FromAccountID
                const updateBalanceQuery = `
                    UPDATE Accounts 
                    SET Balance = Balance - @Amount 
                    WHERE AccountID = @FromAccountID
                `;
                const updateBalanceRequest = connection.request();
                updateBalanceRequest.input("Amount", Amount);
                updateBalanceRequest.input("FromAccountID", FromAccountID);
                await updateBalanceRequest.query(updateBalanceQuery);

                console.log("Balance deducted successfully.");
            } else {
                transactionStatus = 'Failed';
                console.error("Insufficient balance for transaction.");
            }

            // Insert transaction record
            const transactionQuery = `
                INSERT INTO Transactions (TransactionID, FromAccountID, ToAccountID, Amount, TransactionDate, Status, Description, ReferenceNo)
                VALUES (@TransactionID, @FromAccountID, @ToAccountID, @Amount, GETDATE(), @Status, @Description, @ReferenceNo)
            `;
            const transactionRequest = connection.request();
            transactionRequest.input("TransactionID", newTransactionID);
            transactionRequest.input("FromAccountID", FromAccountID);
            transactionRequest.input("ToAccountID", ToAccountID || null); // Allow NULL
            transactionRequest.input("Amount", Amount);
            transactionRequest.input("Status", transactionStatus);
            transactionRequest.input("Description", Description);
            transactionRequest.input("ReferenceNo", newReferenceNo);
            await transactionRequest.query(transactionQuery);

            console.log("Transaction successfully inserted into the database.");
            return { transactionStatus, newReferenceNo };
        } catch (error) {
            console.error("Error during transaction creation:", error);
            throw new Error("Transaction failed to complete");
        } finally {
            connection.close();
        }
    }



    // static async createTransaction(FromAccountID, ToAccountID, Amount, Description) {
    //     const connection = await sql.connect(dbConfig);
    //     // Generate TransactionID
    //     const lastTransactionQuery = `SELECT TOP 1 CAST(SUBSTRING(TransactionID, 2, LEN(TransactionID)) AS INT) AS LastID FROM Transactions ORDER BY LastID DESC`;
    //     const lastTransactionResult = await connection.request().query(lastTransactionQuery);
    //     const lastTransactionID = lastTransactionResult.recordset[0] ? lastTransactionResult.recordset[0].LastID : 0;
    //     const newTransactionID = `T${lastTransactionID + 1}`;

    //     // Generate ReferenceNo
    //     const lastReferenceQuery = `SELECT TOP 1 CAST(ReferenceNo AS INT) AS ReferenceNo FROM Transactions ORDER BY ReferenceNo DESC`;
    //     const lastReferenceResult = await connection.request().query(lastReferenceQuery);
    //     const lastReferenceNo = lastReferenceResult.recordset.length > 0 
    //         ? lastReferenceResult.recordset[0].ReferenceNo 
    //         : '0000000';
    //     const newReferenceNo = (parseInt(lastReferenceNo) + 1).toString().padStart(7, '0');

    //     const getBalanceQuery = `SELECT AccountID, Balance FROM Accounts WHERE AccountID IN (@FromAccountID, @ToAccountID)`;
    //     const balanceRequest = connection.request();
    //     balanceRequest.input("FromAccountID", FromAccountID);
    //     balanceRequest.input("ToAccountID", ToAccountID);

    //     const balanceResult = await balanceRequest.query(getBalanceQuery);
    //     const accounts = Object.fromEntries(balanceResult.recordset.map(a => [a.AccountID, a.Balance]));
    //     const fromBalance = accounts[FromAccountID];

    //     let transactionStatus = 'Pending';

    //     try {
    //         if (fromBalance >= Amount) {
    //             transactionStatus = 'Completed';

    //             const updateBalanceQuery = `
    //                 UPDATE Accounts SET Balance = Balance - @Amount WHERE AccountID = @FromAccountID;
    //                 UPDATE Accounts SET Balance = Balance + @Amount WHERE AccountID = @ToAccountID;
    //             `;
    //             const updateBalanceRequest = connection.request();
    //             updateBalanceRequest.input("Amount", Amount);
    //             updateBalanceRequest.input("FromAccountID", FromAccountID);
    //             updateBalanceRequest.input("ToAccountID", ToAccountID);
    //             await updateBalanceRequest.query(updateBalanceQuery);
    //         } else {
    //             transactionStatus = 'Failed'; // Insufficient balance
    //         }

    //         const transactionQuery = `
    //             INSERT INTO Transactions (TransactionID, FromAccountID, ToAccountID, Amount, TransactionDate, Status, Description, ReferenceNo)
    //             VALUES (@TransactionID, @FromAccountID, @ToAccountID, @Amount, GETDATE(), @Status, @Description, @ReferenceNo);
    //         `;
    //         const transactionRequest = connection.request();
    //         transactionRequest.input("TransactionID", newTransactionID);
    //         transactionRequest.input("FromAccountID", FromAccountID);
    //         transactionRequest.input("ToAccountID", ToAccountID);
    //         transactionRequest.input("Amount", Amount);
    //         transactionRequest.input("Status", transactionStatus);
    //         transactionRequest.input("Description", Description);
    //         transactionRequest.input("ReferenceNo", newReferenceNo);

    //         await transactionRequest.query(transactionQuery);

    //         console.log("Transaction successfully inserted into the database");
    //         return { transactionStatus, newReferenceNo };
    //     } catch (error) {
    //         console.error("Error during transaction creation:", error);
    //         throw new Error("Transaction failed to complete");
    //     } finally {
    //         connection.close();
    //     }
    // }


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

    static async getTransactionsSpendingByUserId(userId) {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `
            SELECT
                YEAR(t.TransactionDate) AS Year,
                MONTH(t.TransactionDate) AS Month,
                SUM(t.Amount) AS TotalSpending
            FROM
                Transactions t
            JOIN 
                Accounts a ON t.FromAccountID = a.AccountID
            WHERE
                t.TransactionDate >= DATEADD(MONTH, -11, CAST(GETDATE() AS DATE)) 
                AND t.TransactionDate < CAST(GETDATE() AS DATE)
                AND t.Status = 'Completed'
                AND a.AccessCode = @userId
            GROUP BY
                YEAR(t.TransactionDate),
                MONTH(t.TransactionDate)
            ORDER BY
                Year DESC, Month DESC;
        `;
        const request = connection.request();
        request.input("userId", userId);

        const result = await request.query(sqlQuery);
        connection.close();
        console.log('results: ' + JSON.stringify(result));
        return result.recordset.map(row => ({
            Year: row.Year,
            Month: row.Month,
            TotalSpending: row.TotalSpending
        }));
    }
}

module.exports = Transactions;
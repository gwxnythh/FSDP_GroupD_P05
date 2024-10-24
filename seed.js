const sql = require('mssql');
const dbConfig = require("./dbConfig");

async function seedDatabase() {
    try {
        await sql.connect(dbConfig);

        // Drop existing tables in the correct order
        await sql.query(`
            IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;
            IF OBJECT_ID('dbo.Accounts', 'U') IS NOT NULL DROP TABLE dbo.Accounts;
            IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
        `);

        // Create the Users table first
        await sql.query(`
            CREATE TABLE Users (
                UserID INT PRIMARY KEY IDENTITY(1,1),
                Username NVARCHAR(50) NOT NULL UNIQUE,
                PasswordHash NVARCHAR(256) NOT NULL,
                FullName NVARCHAR(100) NOT NULL,
                Email NVARCHAR(100),
                IsActive BIT NOT NULL DEFAULT 1,
                CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
            );
        `);

        // Create the Accounts table next
        await sql.query(`
            CREATE TABLE Accounts (
                AccountID INT PRIMARY KEY IDENTITY(1,1),
                UserID INT NOT NULL,
                AccountNumber NVARCHAR(20) NOT NULL UNIQUE,
                AccountType NVARCHAR(50) NOT NULL, -- e.g., Savings, Checking
                Balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
                Currency NVARCHAR(10) NOT NULL DEFAULT 'SGD',
                CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            );
        `);

        // Finally, create the Transactions table
        await sql.query(`
            CREATE TABLE Transactions (
                TransactionID INT PRIMARY KEY IDENTITY(1,1),
                FromAccountID INT NOT NULL,
                ToAccountID INT NOT NULL,
                Amount DECIMAL(18, 2) NOT NULL,
                TransactionDate DATETIME NOT NULL DEFAULT GETDATE(),
                Status NVARCHAR(50) NOT NULL, -- e.g., Completed, Pending, Failed
                Description NVARCHAR(255),
                FOREIGN KEY (FromAccountID) REFERENCES Accounts(AccountID),
                FOREIGN KEY (ToAccountID) REFERENCES Accounts(AccountID)
            );
        `);

        // Insert data into the Users table
        await sql.query(`
            INSERT INTO Users (Username, PasswordHash, FullName, Email)
            VALUES 
                ('john_doe', 'hashed_password_123', 'John Doe', 'john@example.com'),
                ('jane_smith', 'hashed_password_456', 'Jane Smith', 'jane@example.com'),
                ('michael_brown', 'hashed_password_789', 'Michael Brown', 'michael@example.com'),
                ('emily_davis', 'hashed_password_101', 'Emily Davis', 'emily@example.com'),
                ('david_wilson', 'hashed_password_202', 'David Wilson', 'david@example.com');
        `);

        // Insert data into the Accounts table
        await sql.query(`
            INSERT INTO Accounts (UserID, AccountNumber, AccountType, Balance, Currency)
            VALUES 
                (1, 'ACC10000001', 'Savings', 5000.00, 'SGD'), -- John Doe
                (1, 'ACC10000002', 'Checking', 2000.00, 'SGD'), -- John Doe
                (2, 'ACC10000003', 'Savings', 8000.00, 'SGD'), -- Jane Smith
                (2, 'ACC10000004', 'Checking', 1500.00, 'SGD'), -- Jane Smith
                (3, 'ACC10000005', 'Savings', 12000.00, 'SGD'), -- Michael Brown
                (3, 'ACC10000006', 'Checking', 3000.00, 'SGD'), -- Michael Brown
                (4, 'ACC10000007', 'Savings', 7000.00, 'SGD'), -- Emily Davis
                (4, 'ACC10000008', 'Checking', 1000.00, 'SGD'), -- Emily Davis
                (5, 'ACC10000009', 'Savings', 9000.00, 'SGD'), -- David Wilson
                (5, 'ACC10000010', 'Checking', 2500.00, 'SGD'); -- David Wilson
        `);

        // Insert data into the Transactions table
        await sql.query(`
           INSERT INTO Transactions (FromAccountID, ToAccountID, Amount, Status, Description)
           VALUES 
                (1, 3, 500.00, 'Completed', 'Transfer to Jane Smith'), -- John Doe to Jane Smith
                (2, 4, 200.00, 'Completed', 'Bill payment'), -- John Doe to Jane Smith
                (3, 5, 1000.00, 'Completed', 'Loan repayment'), -- Michael Brown to Michael Brown's own savings account
                (4, 1, 300.00, 'Completed', 'Gift to John Doe'), -- Emily Davis to John Doe
                (5, 2, 400.00, 'Completed', 'Transfer to John Doe Checking account'), -- David Wilson to John Doe's Checking
                (6, 8, 250.00, 'Completed', 'Payment for groceries'), -- Michael Brown's Checking to Emily Davis' Checking
                (7, 10, 350.00, 'Pending', 'Money transfer to David Wilson'), -- Emily Davis' Savings to David Wilson's Checking
                (9, 6, 750.00, 'Completed', 'Investment transfer'), -- David Wilson's Savings to Michael Brown's Checking
                (10, 7, 600.00, 'Failed', 'Attempted transfer to Emily Davis'); -- David Wilson's Checking to Emily Davis' Savings
        `);

        console.log('Sample data inserted successfully.');

    } catch (err) {
        console.error('Error inserting sample data:', err.message);
    } finally {
        await sql.close();
    }
}

module.exports = seedDatabase;

const sql = require('mssql');
const dbConfig = require("./dbConfig");
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        await sql.connect(dbConfig);

        // Drop existing tables in the correct order
        await sql.query(`
            IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;
            IF OBJECT_ID('dbo.Accounts', 'U') IS NOT NULL DROP TABLE dbo.Accounts;
            IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
            IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NOT NULL DROP TABLE dbo.RefreshTokens;
        `);

        // Create the Users table first with updated PIN column type
        await sql.query(`
            CREATE TABLE Users (
                UserID NVARCHAR(10) PRIMARY KEY, -- Use custom ID format like U1, U2, etc.
                AccessCode NVARCHAR(14) NOT NULL UNIQUE CHECK (AccessCode LIKE '%[a-zA-Z0-9]%' AND LEN(AccessCode) BETWEEN 6 AND 14),
                PIN NVARCHAR(60) NOT NULL, -- Updated data type to accommodate hashed values
                FullName NVARCHAR(100) NOT NULL,
                Email NVARCHAR(100),
                PhoneNumber CHAR(8) NOT NULL CHECK (PhoneNumber LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'), -- Must be 8 digits,
                IsActive BIT NOT NULL DEFAULT 1,
                CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
            );
        `);

        // Create the Accounts table
        await sql.query(`
            CREATE TABLE Accounts (
                AccountID NVARCHAR(10) PRIMARY KEY, -- Use custom ID format like A1, A2, etc.
                UserID NVARCHAR(10) NOT NULL, -- Reference UserID from Users
                AccessCode NVARCHAR(14) NOT NULL,
                AccountNumber NVARCHAR(15) NOT NULL UNIQUE CHECK (AccountNumber LIKE '717-%[0-9][0-9][0-9][0-9][0-9][0-9]-%[0-9][0-9][0-9]'),
                AccountType NVARCHAR(50) NOT NULL CHECK (AccountType IN ('Savings', 'Current', 'Fixed Deposit Account')),
                Balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
                Currency NVARCHAR(10) NOT NULL DEFAULT 'SGD',
                CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            );
        `);

        // Create the Transactions table
        await sql.query(`
            CREATE TABLE Transactions (
                TransactionID NVARCHAR(10) PRIMARY KEY, -- Use custom ID format like T1, T2, etc.
                FromAccountID NVARCHAR(10) NOT NULL,
                ToAccountID NVARCHAR(10) NOT NULL,
                Amount DECIMAL(18, 2) NOT NULL,
                TransactionDate DATETIME NOT NULL DEFAULT GETDATE(),
                Status NVARCHAR(50) NOT NULL CHECK (Status IN ('Completed', 'Pending', 'Failed')),
                Description NVARCHAR(255),
                ReferenceNo CHAR(7),
                FOREIGN KEY (FromAccountID) REFERENCES Accounts(AccountID),
                FOREIGN KEY (ToAccountID) REFERENCES Accounts(AccountID)
            );
        `);

        // Create the RefreshTokens table
        await sql.query(`
                CREATE TABLE RefreshTokens (
                    token_id INT PRIMARY KEY IDENTITY(1,1),
                    refreshToken VARCHAR(255) NOT NULL UNIQUE
                );
            `)

        // Hash passwords
        let salt = await bcrypt.genSalt(10);
        const hashedPassword1 = await bcrypt.hash('123456', salt);
        salt = await bcrypt.genSalt(10);
        const hashedPassword2 = await bcrypt.hash('654321', salt);
        salt = await bcrypt.genSalt(10);
        const hashedPassword3 = await bcrypt.hash('789123' , salt);
        salt = await bcrypt.genSalt(10);
        const hashedPassword4 = await bcrypt.hash('101010', salt);
        salt = await bcrypt.genSalt(10);
        const hashedPassword5 = await bcrypt.hash('202020', salt);


        // Insert data into the Users table
        await sql.query(`
            INSERT INTO Users (UserID, AccessCode, PIN, FullName, Email, PhoneNumber)
            VALUES 
                ('U1', 'Access123', '${hashedPassword1}', 'John Doe', 'john@example.com', '91234567'),
                ('U2', 'Access456', '${hashedPassword2}', 'Jane Smith', 'jane@example.com', '98765432'),
                ('U3', 'Access789', '${hashedPassword3}', 'Michael Brown', 'michael@example.com', '87654321'),
                ('U4', 'Access101', '${hashedPassword4}', 'Emily Davis', 'emily@example.com', '96543210'),
                ('U5', 'Access202', '${hashedPassword5}', 'David Wilson', 'david@example.com', '95432109');
        `);


        // Insert data into the Accounts table
        await sql.query(`
            INSERT INTO Accounts (AccountID, UserID, AccessCode, AccountNumber, AccountType, Balance, Currency)
            VALUES 
                ('A1', 'U1', 'Access123', '717-154937-001', 'Savings', 5000.00, 'SGD'),
                ('A2', 'U1', 'Access123', '717-154937-002', 'Current', 2000.00, 'SGD'),
                ('A3', 'U2', 'Access456', '717-154937-003', 'Savings', 8000.00, 'SGD'),
                ('A4', 'U2', 'Access456', '717-154937-004', 'Fixed Deposit Account', 1500.00, 'SGD'),
                ('A5', 'U3', 'Access789', '717-154937-005', 'Savings', 12000.00, 'SGD');
        `);

        // Insert data into the Transactions table
        await sql.query(`
            INSERT INTO Transactions (TransactionID, FromAccountID, ToAccountID, Amount, Status, Description,ReferenceNo)
            VALUES 
                ('T1', 'A1', 'A3', 500.00, 'Completed', 'Transfer to Jane Smith','1089550'),
                ('T2', 'A2', 'A4', 200.00, 'Completed', 'Bill payment','1089551'),
                ('T3', 'A3', 'A5', 1000.00, 'Completed', 'Loan repayment','1089552'),
                ('T4', 'A4', 'A1', 300.00, 'Completed', 'Gift to John Doe','1089553'),
                ('T5', 'A5', 'A2', 400.00, 'Completed', 'Transfer to John Doe Checking account','1089554');
        `);

        console.log('Sample data inserted successfully.');

    } catch (err) {
        console.error('Error inserting sample data:', err.message);
    } finally {
        await sql.close();
    }
}

module.exports = seedDatabase;
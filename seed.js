const sql = require('mssql');
const dbConfig = require("./dbConfig");
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        await sql.connect(dbConfig);

        // Drop existing tables in the correct order
        await sql.query(`
            -- Drop tables in reverse order of dependencies
            IF OBJECT_ID('dbo.AccountPrefs', 'U') IS NOT NULL DROP TABLE dbo.AccountPrefs;
            IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;
            IF OBJECT_ID('dbo.Bills', 'U') IS NOT NULL DROP TABLE dbo.Bills;
            IF OBJECT_ID('dbo.Accounts', 'U') IS NOT NULL DROP TABLE dbo.Accounts;
            IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NOT NULL DROP TABLE dbo.RefreshTokens;
            IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
            IF OBJECT_ID('dbo.Rewards', 'U') IS NOT NULL DROP TABLE dbo.Rewards;
        `);


        // Create the Users table first with updated PIN column type
        await sql.query(`
            CREATE TABLE Users (
                UserID NVARCHAR(10) PRIMARY KEY, -- Use custom ID format like U1, U2, etc.
                AccessCode NVARCHAR(14) NOT NULL UNIQUE CHECK (AccessCode LIKE '%[a-zA-Z0-9]%' AND LEN(AccessCode) BETWEEN 6 AND 14),
                PIN NVARCHAR(60) NOT NULL, -- Updated data type to accommodate hashed values
                FullName NVARCHAR(100) NOT NULL,
                Email NVARCHAR(100),
                MobileNumber CHAR(8) NOT NULL CHECK (MobileNumber LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'), -- Must be 8 digits,
                IsActive BIT NOT NULL DEFAULT 1,
                Verified BIT NOT NULL DEFAULT 0,
                VerificationToken NVARCHAR(50),
                ExpiryTokenDate DATETIME DEFAULT GETDATE(),
                CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
            );
        `);

        // Create the Accounts table
        await sql.query(`
            CREATE TABLE Accounts (
                AccountID NVARCHAR(20) PRIMARY KEY, -- Use custom ID format like A1, A2, etc.
                UserID NVARCHAR(10) NOT NULL, -- Reference UserID from Users
                AccessCode NVARCHAR(14) NOT NULL,
                AccountNumber NVARCHAR(15) NOT NULL UNIQUE CHECK (AccountNumber LIKE '717-%[0-9][0-9][0-9][0-9][0-9][0-9]-%[0-9][0-9][0-9]'),
                AccountType NVARCHAR(50) NOT NULL CHECK (AccountType IN ('Savings', 'Current', 'Fixed Deposit')),
                Balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
                Currency NVARCHAR(10) NOT NULL DEFAULT 'SGD',
                CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
                Points INT NOT NULL DEFAULT 0,      -- Stores reward points for each account
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            );
        `);

        // Create the Transactions table
        await sql.query(`
            CREATE TABLE Transactions (
                TransactionID NVARCHAR(10) PRIMARY KEY, -- Use custom ID format like T1, T2, etc.
                FromAccountID NVARCHAR(20) NOT NULL,
                ToAccountID NVARCHAR(20) NULL, -- No FOREIGN KEY constraint
                Amount DECIMAL(18, 2) NOT NULL,
                TransactionDate DATETIME NOT NULL DEFAULT GETDATE(),
                Status NVARCHAR(50) NOT NULL CHECK (Status IN ('Completed', 'Pending', 'Failed')),
                Description NVARCHAR(255),
                ReferenceNo CHAR(7),
                FOREIGN KEY (FromAccountID) REFERENCES Accounts(AccountID)
            );


        `);

        // Create the Billing table
        await sql.query(`
            CREATE TABLE Bills (
                BillingID NVARCHAR(10) PRIMARY KEY,
                AccountID NVARCHAR(20) NOT NULL,
                BillingCompany VARCHAR(100) NOT NULL,
                BillAmount DECIMAL(10, 2) NOT NULL,
                BillingAccNo VARCHAR(50) NOT NULL,
                IsPaid BIT DEFAULT 0, -- New column to track payment status
                FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
            );



        `);

        // Create the Rewards table
        await sql.query(`
            CREATE TABLE Rewards (
                RewardID NVARCHAR(10) PRIMARY KEY,  -- Custom ID format like R1, R2, etc.
                CompanyName NVARCHAR(100) NOT NULL, -- Company offering the reward
                Description NVARCHAR(255) NOT NULL, -- Description of the reward
                PointsRequired INT NOT NULL CHECK (PointsRequired > 0), -- Points needed to redeem
                ExpiryDate DATETIME NOT NULL, -- Expiry date for the reward
                image_path TEXT
                
            );
        `);


        // Create the Billing table
        await sql.query(`
            CREATE TABLE AccountPrefs (
                AccountPrefsId NVARCHAR(10) PRIMARY KEY,
                UserID NVARCHAR(10) NOT NULL, -- Reference UserID from Users
                IsHapticTouch BIT NOT NULL DEFAULT 0,
                IsVoiceOver BIT NOT NULL DEFAULT 0,
                IsVoiceRecognition BIT NOT NULL DEFAULT 0,
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            );

        `);

        // Create the RefreshTokens table
        await sql.query(`
                CREATE TABLE RefreshTokens (
                    token_id INT PRIMARY KEY IDENTITY(1,1),
                    refreshToken VARCHAR(255) NOT NULL UNIQUE
                );
        `)
        /*

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
        INSERT INTO Users (UserID, AccessCode, PIN, FullName, Email, MobileNumber)
        VALUES 
            ('U1', 'Access123', '${hashedPassword1}', 'John Doe', 'john@example.com', '91234567'),
            ('U2', 'Access456', '${hashedPassword2}', 'Jane Smith', 'jane@example.com', '98765432'),
            ('U3', 'Access789', '${hashedPassword3}', 'Michael Brown', 'michael@example.com', '87654321'),
            ('U4', 'Access101', '${hashedPassword4}', 'Emily Davis', 'emily@example.com', '96543210'),
            ('U5', 'Access202', '${hashedPassword5}', 'David Wilson', 'david@example.com', '95432109');
    `);
*/
        // Insert data into the Users table
        await sql.query(`
            INSERT INTO Users (UserID, AccessCode, PIN, FullName, Email, MobileNumber, CreatedAt, Verified)
            VALUES 
                ('U1', 'Access123', '123456', 'John Doe', 'john@example.com', '91234567', '2024-08-01 08:30:00', 1),
                ('U2', 'Access456', '654321', 'Jane Smith', 'jane@example.com', '98765432', '2024-08-02 09:45:00', 1),
                ('U3', 'Access789', '789123', 'Michael Brown', 'michael@example.com', '87654321', '2024-08-03 10:15:00', 1),
                ('U4', 'Access101', '101010', 'Emily Davis', 'emily@example.com', '96543210', '2024-08-04 11:00:00', 1),
                ('U5', 'Access202', '202020', 'David Wilson', 'david@example.com', '95432109', '2024-08-05 14:25:00', 1),
                ('U6', 'S12345678A', 'S12345678A', 'David Wilson', 'david@example.com', '95432109', '2024-08-05 14:25:00', 1);
        `);

        // Insert data into the Accounts table
        await sql.query(`
                INSERT INTO Accounts (AccountID, UserID, AccessCode, AccountNumber, AccountType, Balance, Currency, CreatedAt, Points) 
                VALUES 
                    ('A1', 'U1', 'Access123', '717-154937-001', 'Current', 2500.00, 'SGD', '2024-08-06 15:30:00', 650),
                    ('A2', 'U1', 'Access123', '717-154937-002', 'Savings', 10000.00, 'SGD', '2024-08-07 16:45:00', 650),
                    ('A3', 'U2', 'Access456', '717-154937-003', 'Current', 5500.00, 'SGD', '2024-08-08 17:10:00', 500),
                    ('A4', 'U2', 'Access456', '717-154937-004', 'Fixed Deposit', 5000.00, 'SGD', '2024-08-09 18:20:00', 500),
                    ('A5', 'U3', 'Access789', '717-154937-005', 'Current', 7800.00, 'SGD', '2024-08-10 19:30:00', 800),
                    ('A6', 'U4', 'Access101', '717-154937-006', 'Current', 3200.00, 'SGD', '2024-08-11 20:25:00', 450),
                    ('A7', 'U5', 'Access202', '717-154937-007', 'Current', 6500.00, 'SGD', '2024-08-12 21:45:00', 200);



        `);

        // Insert data into the Transactions table
        await sql.query(`
            INSERT INTO Transactions (TransactionID, FromAccountID, ToAccountID, Amount, TransactionDate, Status, Description, ReferenceNo)
            VALUES 
                ('T1', 'A1', 'A3', 200.00, '2025-01-13 09:00:00', 'Completed', 'Lunch with Jane', '1090001'),
                ('T2', 'A1', 'A6', 50.00, '2025-01-14 12:30:00', 'Completed', 'Payment for Shared Ride', '1090002'),
                ('T3', 'A3', 'A1', 150.00, '2025-08-15 15:45:00', 'Completed', 'Shared gift for friend', '1090003'),
                ('T4', 'A5', 'A3', 300.00, '2025-08-16 17:10:00', 'Completed', 'Reimbursement for Event Tickets', '1090004'),
                ('T5', 'A6', 'A5', 75.00, '2025-08-17 11:20:00', 'Completed', 'Birthday gift', '1090005'),
                ('T6', 'A7', 'A1', 500.00, '2025-08-18 14:30:00', 'Completed', 'Personal Loan Payment to John', '1090006'),
                ('T7', 'A3', 'A7', 600.00, '2025-08-19 18:35:00', 'Completed', 'Payment for Furniture', '1090007'),
                ('T8', 'A1', 'A5', 50.00, '2025-08-20 16:50:00', 'Completed', 'Book purchase', '1090008'),
                ('T9', 'A7', 'A6', 120.00, '2025-08-21 13:35:00', 'Completed', 'Repayment for dinner', '1090009'),
                ('T10', 'A1', 'A6', 250.00, '2024-04-14 12:30:00', 'Completed', 'Payment for Shared Ride', '1090002'),
                ('T11', 'A1', 'A6', 250.00, '2024-08-14 12:30:00', 'Completed', 'Payment for Shared Ride', '1090002'),
                ('T12', 'A1', 'A6', 650.00, '2024-11-14 12:30:00', 'Completed', 'Payment for Shared Ride', '1090002');
        `);

        // Insert data into the Billing table
        await sql.query(`
            INSERT INTO Bills (BillingID, AccountID, BillingCompany, BillAmount, BillingAccNo, IsPaid) 
            VALUES
                ('B1', 'A1', 'PUB', 67.00, 'PUB123456', 0),
                ('B2', 'A1', 'LTA Road Tax', 48.00, 'LTA654321', 0),
                ('B3', 'A1', 'HDB', 55.00, 'HDB987654', 0),
                ('B4', 'A1', 'NTUC Income', 100.00, 'NTUC456789', 0),
                ('B5', 'A3', 'Singtel', 95.25, 'SINGTEL456789', 0),
                ('B6', 'A3', 'Car Insurance', 300, 'CAR456789', 0),
                ('B7', 'A3', 'NUH', 150, 'NUH456789', 0);


        `);

        await sql.query(`
            INSERT INTO Rewards (RewardID, CompanyName, Description, PointsRequired, ExpiryDate, image_path) 
            VALUES
                ('R1', 'New Moon', '$5 off New Moon Gift Set', 300, '2025-12-31', 'images/NewMoon.png'),
                ('R2', 'NTUC FairPrice', '15% off NTUC products', 400, '2025-11-30', 'images/ntuc.png'),
                ('R3', 'Cold Storage', '10% off all items', 350, '2025-10-15', 'images/ColdStorage.png'),
                ('R4', 'Giant', '$10 off minimum $50 spend', 500, '2025-12-31', 'images/Giant.png'),
                ('R5', 'Sheng Siong', '$20 off minimum $100 spend', 600, '2025-08-31', 'images/shengsiong.png'),
                ('R6', 'Starbucks', 'Free Tall Beverage', 450, '2025-09-30', 'images/Starbucks.png');

        `);

        await sql.query(`
            INSERT INTO AccountPrefs (AccountPrefsId, UserID, IsHapticTouch, IsVoiceOver, IsVoiceRecognition)
            VALUES 
                ('P1', 'U1', 1, 1, 0), -- User U1 prefers Haptic Touch and VoiceOver
                ('P2', 'U2', 0, 1, 1), -- User U2 prefers VoiceOver and VoiceRecognition
                ('P3', 'U3', 1, 0, 1), -- User U3 prefers Haptic Touch and VoiceRecognition
                ('P4', 'U4', 0, 0, 0), -- User U4 has no preferences enabled
                ('P5', 'U5', 1, 1, 1); -- User U5 prefers all features
        `);

        console.log('Sample data inserted successfully.');

    } catch (err) {
        console.error('Error inserting sample data:', err.message);
    } finally {
        await sql.close();
    }
}

module.exports = seedDatabase;
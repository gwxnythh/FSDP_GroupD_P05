// Import all modules required
const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const seedDatabase = require("./seed");
const accountsController = require("./controllers/accountsController");
const transactionsController = require("./controllers/transactionsController");
const usersController = require("./controllers/usersController");
const validateAccounts = require("./middlewares/validateAccounts")
const validateTransactions = require("./middlewares/validateTransactions")
const authenticate = require("./middlewares/authenticate")
const validateUsers = require("./middlewares/validateUsers")
const app = express(); // Create an instance of express
const port = process.env.PORT || 3000; // Use environment variable or default port
const staticMiddleware = express.static("public");
// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling
app.use(staticMiddleware);

// Accounts routes
app.get("/accounts", accountsController.getAllAccounts);
app.get("/accounts/:id", accountsController.getAccountById);
app.put("/accounts/:id",accountsController.updateBalance);
//Transactions routes
app.get('/transactions', transactionsController.getAllTransactions);
app.get("/transactions/account/:accountId", transactionsController.getTransactionsByAccountId);
app.post('/transactions', transactionsController.createTransaction);

app.post('/login', async (req, res) => {
  const { accessCode, pin } = req.body; // Retrieve access code and PIN from the request body

  try {
      await sql.connect(dbConfig); // Connect to the database

      // Query to check if the access code and PIN match any records
      const result = await sql.query`
          SELECT u.UserID, u.FullName, a.AccountNumber, a.Balance
          FROM Users u
          JOIN Accounts a ON u.UserID = a.UserID
          WHERE u.AccessCode = ${accessCode} AND u.PIN = ${pin} AND u.IsActive = 1
      `;

      if (result.recordset.length > 0) {
          // If user exists, send back account details
          res.status(200).json({
              message: 'Login successful',
              user: result.recordset[0].FullName,
              accounts: result.recordset.map(account => ({
                  accountNumber: account.AccountNumber,
                  balance: account.Balance,
              }))
          });
      } else {
          res.status(401).json({ message: 'Invalid Access Code or PIN' });
      }
  } catch (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ message: 'Internal server error' });
  } finally {
      await sql.close(); // Close database connection
  }
});




// Start the server and connect to DB
app.listen(port, async () => {
  try {
    // Connect to DB using mssql
    await sql.connect(dbConfig);

    // Seed DB with initial data
    seedDatabase();

    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Gracefully handle shutdown by closing DB connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
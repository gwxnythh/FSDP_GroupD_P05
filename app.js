// Import all modules required
const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const seedDatabase = require("./seed");
const Accounts = require('./models/accounts');
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

//Users routes
app.get("/users/mobile", usersController.getUserByMobile);
app.post("/login", usersController.login);
// Accounts routes
app.get("/accounts/:id", accountsController.getAccountById);
app.put("/accounts/:id",accountsController.updateBalance);
app.get("/accounts", accountsController.getAccountByAccessCode);
//Transactions routes
app.get('/transactions', transactionsController.getAllTransactions);
app.get("/transactions/account/:accountId", transactionsController.getTransactionsByAccountId);
app.post('/transactions', transactionsController.createTransaction);

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
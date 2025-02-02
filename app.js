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
const billsController = require("./controllers/billsController");
const rewardsController = require("./controllers/rewardsController");
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
app.get("/users/id", usersController.getUserById);
app.post("/login", usersController.login);
app.post("/signup", usersController.signUp);
app.get("/users/preference", usersController.getUserPreference);
app.post("/users/preference", usersController.setUserPreference);
app.get("/users/verifyemail/:verificationToken", usersController.verifyToken);

// Accounts routes
app.get("/accounts/:id", accountsController.getAccountById);
app.put("/accounts/:id",accountsController.updateBalance);
app.put("/accounts/:id",accountsController.updatePoints);
app.get("/accounts", accountsController.getAccountByAccessCode);
app.get("/accounts/mobile/:mobileNumber", accountsController.getCurrentAccountByMobile);
app.get("/accounts/balance/:id", accountsController.getAccountBalance);
app.get("/accounts/points/:id", accountsController.getAccountPoints);
app.get("/accounts/spending/:id", accountsController.getAccountSpending);

//Transactions routes
app.get('/transactions', transactionsController.getAllTransactions);
app.get("/transactions/account/:accountId", transactionsController.getTransactionsByAccountId);
app.post('/transactions', transactionsController.createTransaction);
app.post('/transactions/summarize', transactionsController.summarizeTransaction);

//Bills routes
app.get('/bills', billsController.getAllBills);
app.get('/bills/:id', billsController.getBillingById);
app.get('/bills/company/:id', billsController.getBillingCompanyById);
app.get('/bills/amount/:company', billsController.getBillAmountByBillingCompany);
app.get('/bills/account/:company', billsController.getBillingAccNoByBillingCompanyPrefix);
app.get('/bills/account/:id', billsController.getBillsByAccountID);
app.put('/bills/:id/paid', billsController.markBillAsPaid);
app.delete('/bills/:id', billsController.deleteBill);
app.put('/bills/mark-paid-batch', billsController.markBillsAsPaidBatch);

// app.post('/bills/pay', billsController.payBills); // Pay multiple bills at once


//Rewards Routes
app.get('/rewards', rewardsController.getAllRewards);
app.get('/rewards/:id', rewardsController.getRewardsById);
app.post("/rewards/redeem", rewardsController.redeemReward);
app.delete("/rewards/:rewardId", rewardsController.deleteReward);





// Start the server and connect to DB
const server = app.listen(port, async () => {
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

const WebSocket = require("ws");
//customer service
const wss = new WebSocket.Server({ server }); // Attach WebSocket to the same server
let userSocket = null; 
let staffSocket = null;
wss.on("connection", (ws) => {
  console.log("Client connected.");

  ws.on("message", (message) => {
      const data = JSON.parse(message);

      // Handle roles: User or Staff
      if (data.role === "user") {
          console.log("User connected.");
          userSocket = ws;
      } else if (data.role === "staff") {
          console.log("Staff connected.");
          staffSocket = ws;

          // Notify staff that a call is ringing if a user has already initiated
          if (userSocket) {
              staffSocket.send(JSON.stringify({ action: "ringing" }));
          }
      }

      // Handle signaling for WebRTC
      if (data.offer && staffSocket) {
          console.log("Sending offer to staff.");
          staffSocket.send(JSON.stringify({ offer: data.offer }));
      } else if (data.answer && userSocket) {
          console.log("Sending answer to user.");
          userSocket.send(JSON.stringify({ answer: data.answer }));
      } else if (data.candidate) {
          console.log("Sending ICE candidate.");
          if (data.target === "staff" && staffSocket) {
              staffSocket.send(JSON.stringify({ candidate: data.candidate }));
          } else if (data.target === "user" && userSocket) {
              userSocket.send(JSON.stringify({ candidate: data.candidate }));
          }
      }
  });

  ws.on("close", () => {
      console.log("Client disconnected.");
      if (ws === userSocket) userSocket = null;
      if (ws === staffSocket) staffSocket = null;
  });
});

// Gracefully handle shutdown by closing DB connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
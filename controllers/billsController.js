const Bills = require("../models/bills");

const getAllBills = async (req, res) => {
    try {
        const bills = await Bills.getAllBills();
        res.json(bills);
    } catch (error) {
        console.error("Error retrieving all bills:", error);
        res.status(500).send("Error retrieving bills");
    }
};

const getBillingById = async (req, res) => {
    const id = req.params.id;
    try {
        const bill = await Bills.getBillingById(id);
        if (!bill) {
            return res.status(404).send("Bill not found");
        }
        res.json(bill);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving bill");
    }
}

const getBillingCompanyById = async (req, res) => {
    const id = req.params.id;
    try {
        const bill = await Bills.getBillingCompanyById(id);
        if (!bill) {
            return res.status(404).send("Billing Company not found");
        }
        res.json(bill);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving billing Company");
    }
}

const getBillAmountByBillingCompany = async (req, res) => {
    const billingCompany = req.params.company;
    console.log("Received billingCompany: ", billingCompany);
    try {
        const billAmount = await Bills.getBillAmountByBillingCompany(billingCompany);
        console.log("Bill amount retrieved: ", billAmount);
        res.json(billAmount);
    } catch (error) {
        console.error("Error fetching billing amount:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getBillingAccNoByBillingCompanyPrefix = async (req, res) => {
    const billingCompany = req.params.company;
    console.log("Received billingCompany: ", billingCompany);
    try {
        const billingAccountNumbers = await Bills.getBillingAccNoByBillingCompanyPrefix(billingCompany);
        console.log("Billing account numbers retrieved: ", billingAccountNumbers);
        res.json(billingAccountNumbers);
    } catch (error) {
        console.error("Error fetching billing account number:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};

const getBillsByAccountID = async (req, res) => {
    console.log("Request params:", req.params); // Debug log
    const accountId = req.params.id;
    console.log("Received AccountID in request:", accountId); // Debug log

    try {
        const bills = await Bills.getBillsByAccountID(accountId);
        if (bills === null) {
            console.log("No bills found for AccountID:", accountId); // Debug log
            return res.status(404).json({ message: "No bills found" });
        }
        res.json(bills);
    } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ message: "Server error" });
    }
};







module.exports = {
    getAllBills,
    getBillingById,
    getBillingCompanyById,
    getBillingAccNoByBillingCompanyPrefix,
    getBillAmountByBillingCompany,
    getBillsByAccountID   
    
};

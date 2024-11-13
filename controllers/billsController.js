const Bills = require("../models/bills");

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



module.exports = {
    getBillingById,
    getBillingCompanyById,
    getBillingAccNoByBillingCompanyPrefix,
    getBillAmountByBillingCompany,
    
};

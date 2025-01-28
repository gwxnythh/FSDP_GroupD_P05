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

// const markBillAsPaid = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await Bills.markAsPaid(id);
//         if (result) {
//             res.status(200).json({ message: "Bill marked as paid." });
//         } else {
//             res.status(404).json({ message: "Bill not found." });
//         }
//     } catch (error) {
//         console.error("Error marking bill as paid:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// };

const markBillAsPaid = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Bills.markAsPaid(id);
        if (result) {
            res.status(200).json({ message: "Bill marked as paid." });
        } else {
            res.status(404).json({ message: "Bill not found." });
        }
    } catch (error) {
        console.error("Error marking bill as paid:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const deleteBill = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Bills.deleteById(id);
        if (result) {
            res.status(200).json({ message: "Bill deleted successfully." });
        } else {
            res.status(404).json({ message: "Bill not found." });
        }
    } catch (error) {
        console.error("Error deleting bill:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const markBillsAsPaidBatch = async (req, res) => {
    const { billIds } = req.body;
    if (!Array.isArray(billIds)) {
        return res.status(400).json({ message: "Invalid bill IDs" });
    }

    try {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `UPDATE Bills SET IsPaid = 1 WHERE BillingID IN (${billIds.map(id => `'${id}'`).join(",")})`;
        await connection.request().query(sqlQuery);
        connection.close();
        res.status(200).json({ message: "Bills marked as paid." });
    } catch (error) {
        console.error("Error in markBillsAsPaidBatch:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};



module.exports = {
    getAllBills,
    getBillingById,
    getBillingCompanyById,
    getBillingAccNoByBillingCompanyPrefix,
    getBillAmountByBillingCompany,
    getBillsByAccountID,
    markBillAsPaid,
    deleteBill, 
    markBillsAsPaidBatch
    
};

const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Bills {
    constructor(BillingID, BillingCompany, BillAmount, BillingAccNo) {
        this.BillingID = BillingID;
        this.BillingCompany = BillingCompany;
        this.BillAmount = BillAmount;
        this.BillingAccNo = BillingAccNo;
    }

    static async getBillingById(id) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT * FROM Bills WHERE BillingID = @id`;
            const request = connection.request();
            request.input("id", id);
            const result = await request.query(sqlQuery);
            connection.close();
            
            return result.recordset.map(
                row => new Bills(row.BillingID, row.BillingCompany, row.BillAmount, row.BillingAccNo)
            );
        } catch (error) {
            console.error("Error in getBillingById:", error);
            throw new Error("Could not retrieve billing information.");
        }
    }

    static async getBillingCompanyById(id) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT BillingCompany FROM Bills WHERE BillingID = @id`;
            const request = connection.request();
            request.input("id", id);
            const result = await request.query(sqlQuery);
            connection.close();

            return result.recordset.map(
                row => new Bills(row.BillingID, row.BillingCompany, row.BillAmount, row.BillingAccNo)
            );
        } catch (error) {
            console.error("Error in getBillingCompanyById:", error);
            throw new Error("Could not retrieve billing company information.");
        }
    }

    static async getBillAmountByBillingCompany(billingCompany) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `
                SELECT BillAmount
                FROM Bills
                WHERE BillingAccNo LIKE @BillingCompany + '%'`;
    
            const request = connection.request();
            request.input("BillingCompany", billingCompany);
    
            const result = await request.query(sqlQuery);
            connection.close();
    
            // Return the first bill amount if there's at least one result, or null otherwise
            if (result.recordset.length > 0) {
                return { BillAmount: result.recordset[0].BillAmount };
            } else {
                return { BillAmount: null };
            }
        } catch (error) {
            console.error("Error in getBillAmountByBillingCompany:", error);
            throw new Error("Could not retrieve bill amount.");
        }
    }
    
    

    static async getBillingAccNoByBillingCompanyPrefix(billingCompany) {
        const connection = await sql.connect(dbConfig);
        try {
            
            const sqlQuery = `
                SELECT BillingAccNo FROM Bills WHERE BillingAccNo LIKE @BillingCompany + '%'`;
            
            const request = connection.request();
            request.input("BillingCompany", billingCompany);

            const result = await request.query(sqlQuery);
            connection.close();

            return result.recordset.map(row => row.BillingAccNo);
        } catch (error) {
            console.error("Error in getBillingAccNoByBillingCompanyPrefix:", error);
            throw new Error("Could not retrieve billing account number.");
        }
    }

    
}

module.exports = Bills;

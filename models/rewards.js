// models/rewards.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const QRCode = require('qrcode');

class Rewards {
    constructor(RewardID, CompanyName, Description, PointsRequired, ExpiryDate, image_path) {
        this.RewardID = RewardID;
        this.CompanyName = CompanyName;
        this.Description = Description;
        this.PointsRequired = PointsRequired;
        this.ExpiryDate = ExpiryDate;
        this.image_path = image_path;
    }
    

    static async getAllRewards() {
        const connection = await sql.connect(dbConfig);

        const sqlQuery = `SELECT * FROM Rewards`;

        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();

        return result.recordset.map(
            (row) => new Rewards(
                row.RewardID,
                row.CompanyName,
                row.Description,
                row.PointsRequired,
                row.ExpiryDate,
                row.image_path
            )
        );
    }

    static async getRewardsById(id) {
        const connection = await sql.connect(dbConfig);
        try {
            const sqlQuery = `SELECT * FROM Rewards WHERE RewardID = @id`;
            const request = connection.request();
            request.input("id", id);
            const result = await request.query(sqlQuery);
            connection.close();

            return result.recordset.map(
                row => new Rewards(
                    row.RewardID,
                    row.CompanyName,
                    row.Description,
                    row.PointsRequired,
                    row.ExpiryDate,
                    row.image_path)
            );
        } catch (error) {
            console.error("Error in getRewardsById:", error);
            throw new Error("Could not retrieve rewards information.");
        }
    }

    static async redeemReward(accountId, rewardId) {
        const connection = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(connection);
    
        try {
            await transaction.begin();
    
            // Get the reward details
            const rewardQuery = `SELECT * FROM Rewards WHERE RewardID = @rewardId`;
            const rewardRequest = transaction.request();
            rewardRequest.input("rewardId", rewardId);
            const rewardResult = await rewardRequest.query(rewardQuery);
            const reward = rewardResult.recordset[0];
    
            if (!reward) {
                throw new Error("Reward not found");
            }
    
            // Get the account details and points
            const accountQuery = `SELECT * FROM Accounts WHERE AccountID = @accountId`;
            const accountRequest = transaction.request();
            accountRequest.input("accountId", accountId);
            const accountResult = await accountRequest.query(accountQuery);
            const account = accountResult.recordset[0];
    
            if (!account) {
                throw new Error("Account not found");
            }
    
            if (account.Points < reward.PointsRequired) {
                throw new Error("Insufficient points to redeem this reward");
            }
    
            // Deduct points from the account
            const deductPointsQuery = `
                UPDATE Accounts
                SET Points = Points - @pointsRequired
                WHERE AccountID = @accountId
            `;
            const deductPointsRequest = transaction.request();
            deductPointsRequest.input("pointsRequired", reward.PointsRequired);
            deductPointsRequest.input("accountId", accountId);
            await deductPointsRequest.query(deductPointsQuery);
    
            // Generate QR code with reward details
            const qrCodeData = {
                rewardId: reward.RewardID,
                rewardName: reward.Description,
                companyName: reward.CompanyName,
                expiryDate: reward.ExpiryDate,
            };
    
            const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData));
    
            await transaction.commit();
    
            return { success: true, message: "Reward redeemed successfully", qrCode };
        } catch (error) {
            await transaction.rollback();
            console.error("Error in redeemReward:", error);
            throw new Error("Reward redemption failed");
        } finally {
            connection.close();
        }
    }

    static async deleteReward(rewardId) {
        const connection = await sql.connect(dbConfig);
    
        try {
            const sqlQuery = `DELETE FROM Rewards WHERE RewardID = @rewardId`;
            const request = connection.request();
            request.input("rewardId", rewardId);
    
            const result = await request.query(sqlQuery);
    
            if (result.rowsAffected[0] === 0) {
                throw new Error("Reward not found");
            }
    
            return { success: true, message: "Reward deleted successfully" };
        } catch (error) {
            console.error("Error in deleteReward:", error);
            throw new Error("Could not delete the reward");
        } finally {
            connection.close();
        }
    }
    

}

module.exports = Rewards;
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();

class Users {
    constructor(UserID, AccessCode, PIN, FullName, Email, PhoneNumber, IsActive, CreatedAt) {
        this.UserID = UserID,
        this.AccessCode = AccessCode,
        this.PIN = PIN,
        this.FullName = FullName,
        this.Email = Email,
        this.PhoneNumber = PhoneNumber,
        this.IsActive = IsActive,
        this.CreatedAt = CreatedAt
    }

    static async loginAccount(loginAccountData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM Accounts WHERE AccessCode = @AccessCode`;
    
        const request = connection.request();
        request.input("AccessCode", loginAccountData.AccessCode);
    
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        if (result.recordset[0]) {
            const passwordMatch = await bcrypt.compare(loginAccountData.PIN, result.recordset[0].PIN);
            if (passwordMatch) {
                const account = new Users(
                    result.recordset[0].UserID,
                    result.recordset[0].AccessCode,
                    result.recordset[0].PIN,
                    result.recordset[0].FullName,
                    result.recordset[0].Email,
                    result.recordset[0].PhoneNumber,
                    result.recordset[0].IsActive,
                    result.recordset[0].CreatedAt

                );
                const token = await this.generateAccessToken({ UserID: Users.UserID.toString(), PIN: Users.PIN });
    
                const refreshToken = jwt.sign({ UserID: Users.UserID.toString(), PIN: Users.PIN }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
                const salt = await bcrypt.genSalt(10);
                const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    
                const connection = await sql.connect(dbConfig);
                const sqlQuery = `INSERT INTO RefreshTokens (refreshToken) VALUES (@refreshToken);`;
                const request = connection.request();
                request.input("refreshToken", hashedRefreshToken);
                await request.query(sqlQuery);
                connection.close();
                
                return { token: token, refreshToken: refreshToken };
            }
        }
        return null;
    }
    static async generateAccessToken(payload) {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" });
    }
    
    static async refreshAccessToken(refreshToken) {
        try {
            let payload;
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM RefreshTokens WHERE refreshToken IS NOT NULL`;
            const request = connection.request();
            const result = await request.query(sqlQuery);
            connection.close();
    
            if (result.recordset.length === 0) {
                return null;
            }
    
            let match = null;
    
            for (const tokenRecord of result.recordset) {
                const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
                if (isMatch) {
                    match = true;
                    break;
                }
            }
    
            if (!match) {
                return null;
            }
    
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return null
                }
                payload = { UserID: decoded.UserID, PIN: decoded.PIN }
            });
    
            const accessToken = await this.generateAccessToken(payload);
            return accessToken;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    
    static async logout(refreshToken) {
      
        try {
          const connection = await sql.connect(dbConfig);
          const sqlQuery = `SELECT * FROM RefreshTokens WHERE refreshToken IS NOT NULL`;
          const request = connection.request();
          const result = await request.query(sqlQuery);
      
          if (result.recordset.length === 0) {
            return null;
          }
      
          let tokenToDelete = null;
      
          for (const tokenRecord of result.recordset) {
            const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
            if (isMatch) {
              tokenToDelete = tokenRecord.refreshToken;
              break;
            }
          }
      
          if (!tokenToDelete) {
            return null;
          }
      
          const deleteQuery = `DELETE FROM RefreshTokens WHERE refreshToken = @refreshToken`;
          request.input("refreshToken", tokenToDelete);
          await request.query(deleteQuery);
      
          connection.close();
      
          return result.rowsAffected[0] > 0; // Return true if at least one row was affected
        } catch (err) {
            console.error("Error logging out:", err);
            connection.close();
            return false;
        }
    }

}

module.exports = Users;
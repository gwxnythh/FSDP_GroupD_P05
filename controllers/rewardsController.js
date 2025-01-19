// controllers/rewardsController.js
const Rewards = require("../models/rewards");

const getAllRewards = async (req, res) => {
    try {
        const rewards = await Rewards.getAllRewards();
        res.json(rewards);
    } catch (error) {
        console.error("Error retrieving all rewards:", error);
        res.status(500).send("Error retrieving rewards");
    }
};

const getRewardsById = async (req, res) => {
    const id = req.params.id;
    try {
        const rewards = await Rewards.getRewardsById(id);
        if (!rewards) {
            return res.status(404).send("Rewards not found");
        }
        res.json(rewards);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving rewards");
    }
}

const redeemReward = async (req, res) => {
    const { accountId, rewardId } = req.body;

    try {
        const result = await Rewards.redeemReward(accountId, rewardId);
        res.json(result);
    } catch (error) {
        console.error("Error redeeming reward:", error);
        res.status(500).send("Error redeeming reward");
    }
};

const deleteReward = async (req, res) => {
    const { rewardId } = req.params;

    try {
        const result = await Rewards.deleteReward(rewardId);
        res.json(result);
    } catch (error) {
        console.error("Error deleting reward:", error);
        res.status(500).send("Error deleting reward");
    }
};


module.exports = {

    getAllRewards,
    getRewardsById,
    redeemReward,
    deleteReward

}
const AWS = require("aws-sdk");
const db = require("../models");
const { fetchDataFromQueueAndUpdateRewards } = require("../rewards");

const lambda = new AWS.Lambda();

exports.handler = async (event, context) => {
  // Sync DB configuration
  await db.sequelize.sync({ force: false });

  try {
    await fetchDataFromQueueAndUpdateRewards(event);
    return {
      statusCode: 200,
      body: JSON.stringify("Data updated successfully"),
    };
  } catch (error) {
    console.error("Error updating data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify("Error updating data"),
    };
  }
};
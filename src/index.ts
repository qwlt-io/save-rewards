const AWS = require("aws-sdk");
const db = require("../models");
const { fetchDataFromQueueAndUpdateRewards } = require("../rewards");

import * as dotenv from "dotenv";

dotenv.config();

export const handler = async (event, context) => {
  try {
    // Sync DB configuration
    await db.sequelize.sync({ force: false });

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
  } finally {
    await db.sequelize.close();
  }
};



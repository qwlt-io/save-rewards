require("dotenv").config();

import db from "../models";
import { fetchDataFromQueueAndUpdateRewards } from "../rewards";

// Sync DB configuration
db.sequelize.sync({ force: false });

(async () => {
await fetchDataFromQueueAndUpdateRewards();
})();

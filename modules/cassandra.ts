import * as cassandra from "cassandra-driver";
import * as dotenv from "dotenv";

import { CASSANDRA_TABLES, METRIC_TYPE, QUERY } from "../utils/constants";

dotenv.config();

const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const {
  v4: uuidv4,
  parse: uuidParse,
  stringify: uuidStringify,
  validate: uuidValidate,
} = require("uuid");

export default class Cassandra {
  sslOptions1: any = {};
  client: any = {};

  constructor() {
    const certPath = path.join(__dirname, "../src/sf-class2-root.crt");
    const authProvider = new cassandra.auth.PlainTextAuthProvider(
      process.env.CASSANDRA_USER,
      process.env.CASSANDRA_PASSWORD
    );

    this.sslOptions1 = {
      ca: [fs.readFileSync(certPath, "utf-8")],
      host: process.env.CASSANDRA_HOST,
      rejectUnauthorized: false,
    };

    this.client = new cassandra.Client({
      contactPoints: [process.env.CASSANDRA_HOST],
      localDataCenter: process.env.CASSANDRA_REGION,
      keyspace: process.env.CASSANDRA_KEYSPACE,
      authProvider: authProvider,
      sslOptions: this.sslOptions1,
      protocolOptions: { port: 9142 },
    });
  }

  async closeCassandraConnection() {
    this.client.shutdown();
  }

  async isFirstTimeLoginForTheDay(userId) {
    try {
      let query = await this.getQuery(
        CASSANDRA_TABLES.USER_APP_OPENINGS,
        "SELECT"
      );
      const currentDate = new Date();
      const todayDate = currentDate.toISOString().split("T")[0];
      let params = [userId, todayDate];
      let dataAlreadyPresent = await this.executeSelectQuery(query, params);
      if (dataAlreadyPresent?.length > 0) {
        return false;
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async logFirstTimeLoginForTheDay(userId) {
    try {
      console.log("Log user app first time opening for the day");
      let query = await this.getQuery(
        CASSANDRA_TABLES.USER_APP_OPENINGS,
        "INSERT"
      );
      const currentDateTime = new Date();
      const todayDate = currentDateTime.toISOString().split("T")[0];

      const hours = currentDateTime.getHours().toString().padStart(2, "0");
      const minutes = currentDateTime.getMinutes().toString().padStart(2, "0");
      const seconds = currentDateTime.getSeconds().toString().padStart(2, "0");
      const milliseconds = currentDateTime
        .getMilliseconds()
        .toString()
        .padStart(3, "0");

      const cassandraTimeFormat = `${hours}:${minutes}:${seconds}.${milliseconds}`;

      let params = [userId, todayDate, cassandraTimeFormat];
      await this.executeQuery(query, params);
    } catch (err) {
      console.log("err inserting into cassandra", err);
    }
  }

  async getQuery(type, action?) {
    switch (type) {
      case METRIC_TYPE.STEP_COUNT:
        return QUERY.INSERT_FOR_STEP_COUNT;
      case METRIC_TYPE.GPS:
        return QUERY.INSERT_FOR_GPS;
      case METRIC_TYPE.SCREEN_TIME:
        return QUERY.INSERT_FOR_SCREEN_TIME;
      case CASSANDRA_TABLES.WALLET_TRANSACTION:
        return QUERY.INSERT_FOR_WALLET_TRANSACTION;
      case CASSANDRA_TABLES.USER_APP_OPENINGS:
        if (action == "SELECT") {
          return QUERY.GET_USER_APP_OPENINGS;
        } else {
          return QUERY.INSERT_USER_APP_OPENINGS;
        }
    }
  }

  async executeSelectQuery(query, params) {
    let result: any = {};
    const options = {
      prepare: true,
      consistency: cassandra.types.consistencies.localQuorum,
    };
    result = await this.client.execute(query, params, options);
    if (result) {
      return result?.rows;
    }

    return result;
  }

  async executeQuery(query, params) {
    let message = "failed";
    const options = {
      prepare: true,
      consistency: cassandra.types.consistencies.localQuorum,
    };
    console.log("query", query);
    console.log("params", params);
    let result = await this.client.execute(query, params, options);
    console.log("result", result);
    if (result) {
      message = "success";
    }

    return message;
  }

  public async executeInsertQueryForScreenTime(inputParams) {
    let { userId, startDate, endDate, createdAt, updatedAt } = inputParams;
    let id = uuidv4();

    let query = await this.getQuery(METRIC_TYPE.SCREEN_TIME);
    const params = [id, userId, startDate, endDate, createdAt, updatedAt];
    console.log("query", query);
    console.log("params", params);
    let result = await this.executeQuery(query, params);
  }

  public async executeInsertQueryForStepCount(rewardPointsParamsForStepCount) {
    let { userId, stepCount, createdAt, updatedAt } =
      rewardPointsParamsForStepCount;
    let id = uuidv4();

    let query = await this.getQuery(METRIC_TYPE.STEP_COUNT);
    const params = [id, userId, stepCount, createdAt, updatedAt];
    console.log("query", query);
    console.log("params", params);
    let result = await this.executeQuery(query, params);
    console.log("result", result);

    return result;
  }

  public randomInRange(min, max) {
    return Math.random() < 0.5
      ? (1 - Math.random()) * (max - min) + min
      : Math.random() * (max - min) + min;
  }

  public async executeInsertQueryForWalletTransactions(walletTransactionInput) {
    const {
      id,
      userId,
      walletId,
      txnType,
      coinType,
      rewardPoints,
      rewardTypeId,
      createdAt,
      updatedAt,
    } = walletTransactionInput;

    const query = await this.getQuery(CASSANDRA_TABLES.WALLET_TRANSACTION);
    const params = [
      id,
      userId,
      walletId,
      txnType,
      rewardPoints,
      coinType,
      rewardTypeId,
      createdAt,
      updatedAt,
    ];

    const result = await this.executeQuery(query, params);

    return result;
  }

  public async executeInsertQueryForGPS(rewardPointsParamsForGPS) {
    const request = {
      userId: rewardPointsParamsForGPS.userId,
      lat: parseFloat(rewardPointsParamsForGPS?.lat?.toFixed(2)),
      long: parseFloat(rewardPointsParamsForGPS?.lng?.toFixed(2)),
      createdAt: rewardPointsParamsForGPS.createdAt,
      updatedAt: new Date().getTime(),
      id: uuidv4(),
    };
    let { id, userId, lat, long, createdAt, updatedAt } = request;

    const query = await this.getQuery(METRIC_TYPE.GPS);
    const params = [id, userId, lat, long, createdAt, updatedAt];

    const result = await this.executeQuery(query, params);

    return result;
  }
}

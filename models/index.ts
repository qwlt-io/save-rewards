import { dbConfig } from '../config/db.config';
const path = require('path');



const Sequelize = require("sequelize");

//Connect to sequelize using configs of the given db
export const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: process.env.POSTGRESQL_PORT || 5432,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false,
    // Add the SSL option for secure connections (if required)
    // dialectOptions: {
    //   ssl: {
    //     require: true, // Require SSL
    //     rejectUnauthorized: false, // For self-signed certificates, set to false
    //     ca: path.join(__dirname, '../../us-east-2-bundle.pem'), // Provide the path to your RDS SSL certificate
    //   },
    // },
});


const db:any = {
  Sequelize,
  sequelize
};

const userModel = require('./user.model')
const walletModel = require('./wallet.model')
const walletTransactionsModel = require('./walletTransactions.model')

db.user = userModel.user(sequelize,Sequelize)
db.wallet = walletModel.wallet(sequelize,Sequelize)
db.walletTransactions = walletTransactionsModel.walletTransactions(sequelize,Sequelize)


export default db;

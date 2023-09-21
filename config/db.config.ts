
export const dbConfig = {
    HOST: process.env.END_POINT || "localhost",
    USER: process.env.POSTGRES_USER || "ankitsalvi",
    PASSWORD: process.env.POSTGRES_PASSWORD || "root",
    DB: process.env.POSTGRES_DATABASE || "postgres",
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false, // Disable query logging
  
  };
  
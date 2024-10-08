const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  RABBIT_CONNECTION_URI: process.env.RABBIT_MQ_CONNECTION_URI !== undefined ? process.env.RABBIT_MQ_CONNECTION_URI : "",
  EXCHANGE_NAME: process.env.EXCHANGE_NAME !== undefined ? process.env.EXCHANGE_NAME : "",
  QUEUE_NAME: process.env.QUEUE_NAME,
};

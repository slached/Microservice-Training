const dotenv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  dotenv.config({ path: `.env/${process.env.NODE_ENV}` });
} else {
  dotenv.config();
}

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
};

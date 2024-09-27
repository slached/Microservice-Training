require("dotenv").config();

const express = require("express");
const { PORT } = require("./config");
const { databaseConnection } = require("./database");
const { customer, appEvents } = require("./api");
const cors = require("cors");
require("colors");

const HandleErrors = require("./utils/error-handler");

const StartServer = async () => {
  const app = express();

  //db connection
  await databaseConnection()
    .then((res) => {
      console.log(res.cyan.bold.underline);
    })
    .catch((err) => {
      console.log(err);
    });

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cors());

  appEvents(app);
  customer(app);

  // error handling
  app.use(HandleErrors);

  app
    .listen(PORT, () => {
      console.log(`App listening to port ${PORT}`.green.bold.underline);
    })
    .on("error", (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();

const mongoose = require("mongoose");
const { DB_URL } = require("../config/index");

module.exports = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(DB_URL)
      .then(() => {
        resolve("DB Connection is success");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

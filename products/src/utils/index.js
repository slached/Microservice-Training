const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const { APP_SECRET } = require("../config");
const { APIError, STATUS_CODES } = require("./app-errors");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (enteredPassword, savedPassword, salt) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    const payload = await jwt.verify(signature, APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.SendRequestToTheAnotherService = async (payload, serviceName) => {
  const request = await axios.post(`http://localhost:8000/${serviceName}/app-events`, { payload: payload });
  if (request.status === 200) {
    return request.data;
  } else {
    throw new APIError(
      "Axios Request Error",
      STATUS_CODES.BAD_REQUEST,
      "An error occurred while communication between services",
      true
    );
  }
};

const CustomerService = require("../services/customer-service");
const { APIError, STATUS_CODES } = require("../utils/app-errors");

module.exports = async (app) => {
  const service = new CustomerService();
  app.use("/app-events", async (req, res, next) => {
    try {
      console.log("========Another service triggered Customer Service========");
      const { payload } = req.body;
      const response_data = await service.SubscribeEvents(payload);
      return res.status(200).json(response_data);
    } catch (err) {
      return new APIError("Error while Customer service communication", STATUS_CODES.BAD_REQUEST, err.message, true);
    }
  });
};

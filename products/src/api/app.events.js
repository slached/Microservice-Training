const ProductService = require("../services/product-service");
const { APIError, STATUS_CODES } = require("../utils/app-errors");

module.exports = async (app) => {
  const service = new ProductService();
  app.use("/app-events", async(req, res, next) => {
    try {
    
      const { payload } = req.body;
      const response_data = await service.SubscribeEvents(payload);
      return res.status(200).json(response_data);
    } catch (err) {
      return new APIError("", STATUS_CODES.BAD_REQUEST, err.message, true);
    }
  });
};

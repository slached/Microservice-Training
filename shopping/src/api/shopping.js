const ShoppingService = require("../services/shopping-service");
const { SendRequestToTheAnotherService } = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app) => {
  const service = new ShoppingService();

  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;

    try {
      const { data } = await service.PlaceOrder({ _id, txnNumber });
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const payload = { event: "GET_SHOPPING_DETAILS", data: { _id: _id } };
      const { data } = await SendRequestToTheAnotherService(payload, "customer");
      return res.status(200).json(data.orders);
    } catch (err) {
      next(err);
    }
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      const payload = { event: "GET_SHOPPING_DETAILS", data: { _id: _id } };
      const { data } = await SendRequestToTheAnotherService(payload, "customer");
      return res.status(200).json(data.cart);
    } catch (err) {
      next(err);
    }
  });
};

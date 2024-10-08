const ShoppingService = require("../services/shopping-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new ShoppingService();
  SubscribeMessage(channel, "SHOPPING_ROUTING_KEY", service);

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
      const message = JSON.stringify({ event: "GET_SHOPPING_DETAILS", data: { _id: _id } });
      const { data } = await PublishMessage(channel, "CUSTOMER_ROUTING_KEY", message);
      return res.status(200).json(data.orders);
    } catch (err) {
      next(err);
    }
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      const message = JSON.stringify({ event: "GET_SHOPPING_DETAILS", data: { _id: _id } });
      const { data } = await PublishMessage(channel, "CUSTOMER_ROUTING_KEY", message);
      return res.status(200).json(data.cart);
    } catch (err) {
      next(err);
    }
  });
};

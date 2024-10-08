const ProductService = require("../services/product-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new ProductService();
  SubscribeMessage(channel, "PRODUCT_ROUTING_KEY", service);

  app.post("/create", async (req, res, next) => {
    try {
      const { name, desc, type, unit, price, available, suplier, banner } = req.body;
      // validation
      const { data } = await service.CreateProduct({ name, desc, type, unit, price, available, suplier, banner });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/category/:type", async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/ids", async (req, res, next) => {
    try {
      const { ids } = req.body;
      const products = await service.GetSelectedProducts(ids);
      return res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  });

  app.put("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const product = await service.GetProductById(req.body._id);
      const message = JSON.stringify({ event: "ADD_TO_WISHLIST", data: { _id: _id, product: product } });
      const wishList = await PublishMessage(channel, "CUSTOMER_ROUTING_KEY", message);
      return res.status(200).json(wishList);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/wishlist/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    try {
      const product = await service.GetProductById(productId);
      const message = JSON.stringify({ event: "ADD_TO_WISHLIST", data: { _id: _id, product: product } });
      const wishList = await PublishMessage(channel, "CUSTOMER_ROUTING_KEY", message);
      return res.status(200).json(wishList);
    } catch (err) {
      next(err);
    }
  });

  app.put("/cart", UserAuth, async (req, res, next) => {
    const { _id, qty } = req.body;

    try {
      const product = await service.GetProductById(_id);
      const message = JSON.stringify({ event: "ADD_TO_CART", data: { _id: req.user._id, product: product, qty: qty } });
      const result = await PublishMessage(channel, "CUSTOMER_ROUTING_KEY", message);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const product = await service.GetProductById(req.params.id);
      const message = { event: "REMOVE_FROM_CART", data: { _id: _id, product: product, qty: 0 } };
      const result = await PublishMessage(channel, "CUSTOMER_ROUTING_KEY", message);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  //get Top products and category
  app.get("/", async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });
};

const cors = require("cors");
const proxy = require("express-http-proxy");
const express = require("express");

const ServerStart = async () => {
  const PORT = process.env.PORT || 8000;
  const app = express();

  app.use(cors());

  //proxy
  app.use("/customer", proxy("http://localhost:8001"));
  app.use("/product", proxy("http://localhost:8002"));
  app.use("/shopping", proxy("http://localhost:8003"));

  app
    .listen(PORT, () => {
      console.log(`Gateway listening on port ${PORT}`);
    })
    .on("error", (err) => {
      console.log(err);
    });
};

ServerStart();

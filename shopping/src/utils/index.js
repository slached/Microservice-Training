const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { APP_SECRET, RABBIT_CONNECTION_URI, EXCHANGE_NAME, QUEUE_NAME } = require("../config");
const amqp = require("amqplib");

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

// message broker implementation

module.exports.CreateChannel = async () => {
  try {
    const connection = await amqp.connect(RABBIT_CONNECTION_URI);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct");
    return channel;
  } catch (error) {
    return error;
  }
};

module.exports.PublishMessage = async (channel, routing_key, message) => {
  try {
    return await channel.publish(EXCHANGE_NAME, routing_key, Buffer.from(message));
  } catch (error) {
    return error;
  }
};

module.exports.SubscribeMessage = async (channel, routing_key, service) => {
  try {
    const queue = await channel.assertQueue(QUEUE_NAME);
    await channel.bindQueue(queue.queue, EXCHANGE_NAME, routing_key);
    channel.consume(queue.queue, async (data) => {
      console.log("data received");

      if (data.fields.routingKey === routing_key) {
        channel.ack(data);
        const message = JSON.parse(data.content);
        return await service.SubscribeEvents(message);
      }
    });
  } catch (error) {
    return error;
  }
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const { APP_SECRET, RABBIT_CONNECTION_URI, EXCHANGE_NAME, QUEUE_NAME } = require("../config");

//Utility functions
const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};
const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

const ValidatePassword = async (enteredPassword, savedPassword) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

const GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

const ValidateSignature = async (req) => {
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

const FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

// message broker implementation

const CreateChannel = async () => {
  try {
    const connection = await amqp.connect(RABBIT_CONNECTION_URI);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct");
    return channel;
  } catch (error) {
    return error;
  }
};

const PublishMessage = async (channel, routing_key, message) => {
  try {
    return await channel.publish(EXCHANGE_NAME, routing_key, Buffer.from(message));
  } catch (error) {
    return error;
  }
};

const SubscribeMessage = async (channel, routing_key, service) => {
  try {
    const queue = await channel.assertQueue(QUEUE_NAME);
    await channel.bindQueue(queue.queue, EXCHANGE_NAME, routing_key);
    channel.consume(queue.queue, async(data) => {
      console.log("data received");

      if (data.fields.routingKey === routing_key) {
        channel.ack(data);       
        const message = JSON.parse(data.content)
        return await service.SubscribeEvents(message)
      }
    });
  } catch (error) {
    return error;
  }
};

module.exports = {
  GenerateSalt,
  GeneratePassword,
  ValidatePassword,
  GenerateSignature,
  ValidateSignature,
  FormateData,
  CreateChannel,
  SubscribeMessage,
  PublishMessage,
};

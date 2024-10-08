const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const uuid = require("uuid");

const { APP_SECRET, RABBIT_CONNECTION_URI, EXCHANGE_NAME, QUEUE_NAME } = require("../config");

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
    return await connection.createChannel();
  } catch (error) {
    return error;
  }
};

module.exports.ClientMessage = async (channel, payload, RPC_QUEUE_NAME) => {
  try {
    const correlationId = uuid.v1();

    const q = await channel.assertQueue("", { exclusive: true });
    //note payload is stringified object
    await channel.sendToQueue(RPC_QUEUE_NAME, Buffer.from(payload), {
      correlationId: correlationId,
      replyTo: q.queue,
    });

    channel.prefetch(1);
    return new Promise((resolve, reject) => {
      // if there is not get any response in 13 seconds, reject the response
      const maxTimeOut = setTimeout(async () => {
        await channel.deleteQueue(q.queue);
        reject("Request has been timeout");
      }, 10000);
      channel.consume(
        q.queue,
        async (msg) => {
          if (msg?.content) {
            if (msg.properties.correlationId === correlationId) {
              channel.ack(msg);
              await channel.deleteQueue(q.queue);
              clearTimeout(maxTimeOut);
              resolve(await JSON.parse(msg.content.toString()));
            } else {
              await channel.deleteQueue(q.queue);
              reject("Correlation id is manipulated");
            }
          }
        },
        {
          noAck: false,
        }
      );
    });
  } catch (error) {
    return error;
  }
};

module.exports.Server = async (channel, service) => {
  try {
    const q = await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);
    channel.consume(
      q.queue,
      async (msg) => {
        // msg comes as buffer so we need to convert it to string first
        // actually msg content is stringified object so after conversation to buffer to string
        // we could parse it into object again
        const parsedMessage = await JSON.parse(msg.content.toString());
        const serviceResponse = await service.SubscribeEvents(parsedMessage);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(serviceResponse)), {
          correlationId: msg.properties.correlationId,
        });
        channel.ack(msg);
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    return error;
  }
};

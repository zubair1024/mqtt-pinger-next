import mqtt, { IClientOptions } from "mqtt";
import fs from "fs";
import path from "path";
import { variables } from "./variables";
import { connectDB } from "./db/db";
import { logger } from "./logger";
import { Ping } from "./db/models/Ping";

const brokerUrl = variables.MQTT_URL as string;

const options: IClientOptions = {
  port: Number(variables.MQTT_PORT),
};
const ca = fs.readFileSync(path.resolve("./src/assets/tls_client_ca.crt"));
const cert = fs.readFileSync(path.resolve("./src/assets/tls_client_cert.crt"));
const key = fs.readFileSync(path.resolve("./src/assets/tls_client_key.key"));
Object.assign(options, {
  ca: ca,
  cert: cert,
  key: key,
  rejectUnauthorized: false,
});

async function run() {
  await connectDB();

  logger.info(
    `Connecting to ${brokerUrl} with options ${JSON.stringify(
      options,
      null,
      2
    )}`
  );

  const client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    console.log("Connected to MQTT broker ✅");
    client.subscribe(variables.MQTT_PING_TOPIC);
  });

  client.on("message", (topic, message) => {
    const eventTime = new Date();
    console.log(
      `Received message on topic '${topic}': ${message.toString()} at ${eventTime.toISOString()}`
    );
    const date = new Date(message.toString());
    const ping = new Ping({
      eventTime: date,
      message: message.toString(),
    });
    ping.save();
  });

  client.on("error", (err) => {
    logger.error("client error");
    logger.error(err);
  });

  client.on("disconnect", (err) => {
    logger.error("client disconnect");
    logger.error(err);
  });

  client.on("reconnect", () => {
    logger.error("client reconnect");
  });

  setInterval(() => {
    client.publish(variables.MQTT_PING_TOPIC, `${new Date().toISOString()}`);
  }, 1000);
}

run().catch((err) => {
  logger.error(err);
});

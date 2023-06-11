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
  protocol: "mqtt",
};

if (variables.MQTT_TLS) {
  const ca = fs.readFileSync(path.resolve("/", "assets", "ca.crt"));
  const cert = fs.readFileSync(path.resolve("/", "assets", "client.crt"));
  const key = fs.readFileSync(path.resolve("/", "assets", "client.key"));
  Object.assign(options, {
    ca: ca,
    cert: cert,
    key: key,
    rejectUnauthorized: false,
  });
}

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
    const ping = new Ping({
      eventTime,
      message: message.toString(),
    });
    ping.save();
  });

  setInterval(() => {
    client.publish(variables.MQTT_PING_TOPIC, "Hello, from pinger!");
  }, 1000);
}

run().catch((err) => {
  logger.error(err);
});

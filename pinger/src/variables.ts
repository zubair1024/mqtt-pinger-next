import dotenv from "dotenv";
dotenv.config();
export const variables = {
  MQTT_URL: process.env.NX_MQTT_URL,
  MQTT_PORT: Number(process.env.NX_MQTT_PORT ?? 1883),
  MQTT_PING_TOPIC: process.env.NX_MQTT_PING_TOPIC ?? "",
  MQTT_TLS: process.env.NX_MQTT_PING_TOPIC === "true" ? true : false,
};

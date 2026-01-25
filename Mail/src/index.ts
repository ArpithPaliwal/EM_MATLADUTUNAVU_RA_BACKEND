import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
console.log("MAIL ENV CHECK:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS_LENGTH: process.env.EMAIL_PASS?.length,
});

import { connectRabbitMQ } from "./rabbitmq/connection.rabbitmq.js";
import { startMailConsumer } from "./rabbitmq/consumer.rabbitmq.js";

async function startMailService(): Promise<void> {
  try {
    await connectRabbitMQ();
    await startMailConsumer();

    console.log("Mail service started successfully and is consuming messages");
  } catch (error) {
    console.error("Mail service failed to start", error);
    process.exit(1);
  }
}

startMailService();

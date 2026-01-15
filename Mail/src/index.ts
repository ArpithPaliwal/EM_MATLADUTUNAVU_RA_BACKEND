import "dotenv/config";
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

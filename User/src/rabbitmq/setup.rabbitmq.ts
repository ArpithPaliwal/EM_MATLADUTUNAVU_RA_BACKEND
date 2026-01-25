import { getChannel } from "./connection.rabbitmq.js";

export async function setupRabbit(): Promise<void> {
  const channel = getChannel();

  await channel.assertExchange("mail.exchange", "direct", {
    durable: true,
  });

  console.log("RabbitMQ exchanges asserted");
}

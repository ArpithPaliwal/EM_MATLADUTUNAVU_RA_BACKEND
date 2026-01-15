import { getChannel } from "./connection.rabbitmq.js";

export async function setupRabbit() {
  const channel = getChannel();

  await channel.assertExchange("chat.events", "fanout", {
    durable: true
  });

  await channel.assertExchange("mail.events", "direct", {
    durable: true
  });
}

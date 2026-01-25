import amqp from "amqplib";
import type { Channel, ChannelModel } from "amqplib";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<Channel> {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL;
  if (!url) throw new Error("RABBITMQ_URL missing");

  connection = await amqp.connect(url);
  channel = await connection.createChannel();

  await channel.prefetch(1);

  connection.on("error", (err) => {
    console.error("RabbitMQ error:", err);
    process.exit(1);
  });

  connection.on("close", () => {
    console.error("RabbitMQ connection closed");
    process.exit(1);
  });

  console.log("RabbitMQ connected (mail service)");
  return channel;
}

export function getChannel(): Channel {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
}

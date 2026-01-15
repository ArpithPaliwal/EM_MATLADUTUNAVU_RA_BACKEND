
import amqp from 'amqplib';
import type { ChannelModel, Channel } from 'amqplib';


let connection:ChannelModel | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<Channel> {
  if (channel) return channel;

  const rabbitUrl = process.env.RABBITMQ_URL;
  if (!rabbitUrl) {
    throw new Error("RABBIT_URL is not defined");
  }

  connection = await amqp.connect(rabbitUrl);

  connection.on("error", (err) => {
    console.error("RabbitMQ connection error:", err);
    process.exit(1);
  });

  connection.on("close", () => {
    console.error("RabbitMQ connection closed");
    process.exit(1);
  });

  channel = await connection.createChannel();

  // Prevent worker overload
  await channel.prefetch(1);

  console.log("RabbitMQ connected (mail service)");

  return channel;
}

export function getChannel(): Channel {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
}

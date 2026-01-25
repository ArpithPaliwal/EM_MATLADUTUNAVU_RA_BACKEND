import amqp from "amqplib";
import type { ConfirmChannel, ChannelModel ,Channel} from "amqplib";

let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null = null;


export async function connectRabbitMQ(): Promise<ConfirmChannel> {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL;
  if (!url) throw new Error("RABBITMQ_URL missing");

  connection = await amqp.connect(url);
  channel = await connection.createConfirmChannel();

  connection.on("error", (err) => {
    console.error("RabbitMQ error:", err);
  });

  connection.on("close", () => {
    console.error("RabbitMQ closed");
    channel = null;
    connection = null;
  });

  console.log("RabbitMQ connected (user service)");
  return channel;
}

export function getChannel(): ConfirmChannel {
  if (!channel) throw new Error("RabbitMQ not connected");
  return channel;
}

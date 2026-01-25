import { getChannel } from "./connection.rabbitmq.js";
import type { MailPayload } from "../dtos/mailPayload.dto.js";

const EXCHANGE = "mail.exchange";
const ROUTING_KEY = "mail.send";

export async function sendMail(payload: MailPayload): Promise<void> {
  const channel = getChannel();

  channel.publish(
    EXCHANGE,
    ROUTING_KEY,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );

  await channel.waitForConfirms();
}

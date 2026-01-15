import type { MailPayload } from "../dtos/mailPayload.dto.js";
import { getChannel } from "./connection.rabbitmq.js";

const exchange: string = "mail.exchange";
const routingKey = "mail.send";


export async function sendMail(message: MailPayload): Promise<void> {
    const channel = getChannel();

    const published = channel.publish(
        exchange,                 // direct exchange
        routingKey,                    // routing key 
        Buffer.from(JSON.stringify(message)),
        {
            persistent: true
        }
    );
     if (!published) {
    console.warn("Mail message buffered due to backpressure");
  }
}

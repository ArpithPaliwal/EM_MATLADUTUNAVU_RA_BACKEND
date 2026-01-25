import { getChannel } from "./connection.rabbitmq.js";
import nodemailer from "nodemailer";

const EXCHANGE = "mail.exchange";
const QUEUE = "mail.queue";
const ROUTING_KEY = "mail.send";

const user = process.env.USER;
const pass = process.env.PASS;

if (!user || !pass) {
  throw new Error("Mail credentials missing");
}


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

export async function startMailConsumer(): Promise<void> {
  const channel = getChannel();

  await channel.assertExchange(EXCHANGE, "direct", { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  console.log("Mail consumer waiting for messages");

  channel.consume(QUEUE, async (message) => {
    if (!message) return;

    try {
      const { to, subject, body } = JSON.parse(
        message.content.toString()
      );

      await transporter.sendMail({
        from: `"EM MATLADUTUNAVU RA" <${user}>`,
        to,
        subject,
        text: body,
      });

      console.log(`Mail sent to ${to}`);
      channel.ack(message);

    } catch (error) {
      console.error("Mail send failed:", error);

     
      channel.nack(message, false, false); // drop or send to DLQ
    }
  });
}

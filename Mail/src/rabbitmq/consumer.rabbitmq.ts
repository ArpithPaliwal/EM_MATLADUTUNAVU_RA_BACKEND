import { getChannel } from "./connection.rabbitmq.js";
import nodemailer from "nodemailer";

const EXCHANGE = "mail.exchange";
const QUEUE = "mail.queue";
const ROUTING_KEY = "mail.send";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

if (!user || !pass) {
  throw new Error("Mail credentials missing");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

// 🔴 VERIFY SMTP ON BOOT (FAIL FAST)
await transporter.verify();
console.log("SMTP verified and ready");

export async function startMailConsumer(): Promise<void> {
  const channel = getChannel();

  await channel.assertExchange(EXCHANGE, "direct", { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);


  channel.prefetch(1);

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

      
      channel.nack(message, false, false);
    }
  });
}

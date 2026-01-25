import { getChannel } from "./connection.rabbitmq.js";
import nodemailer from "nodemailer";

const EXCHANGE = "mail.exchange";
const QUEUE = "mail.queue";
const ROUTING_KEY = "mail.send";

export async function startMailConsumer(): Promise<void> {
  // ✅ READ ENV ONLY INSIDE FUNCTION
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("Mail credentials missing");
  }

  // ✅ CREATE TRANSPORTER AFTER ENV IS READY
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  // ✅ VERIFY SMTP ON SERVICE START
  await transporter.verify();
  console.log("SMTP verified and ready");

  const channel = getChannel();

  await channel.assertExchange(EXCHANGE, "direct", { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  // 🔴 CRITICAL
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

      // ✅ ACK ON SUCCESS
      channel.ack(message);

    } catch (error) {
      console.error("Mail send failed:", error);

      // ❌ NACK ON FAILURE (NO REQUEUE)
      channel.nack(message, false, false);
    }
  });
}

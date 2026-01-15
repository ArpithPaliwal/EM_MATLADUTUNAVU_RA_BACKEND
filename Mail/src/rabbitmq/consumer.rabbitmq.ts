import { getChannel } from "./connection.rabbitmq.js";
import nodemailer from "nodemailer"
const exchange: string = "mail.exchange";
const queue: string = "mailqueue";
const routingkey: string = "mail.send";

const user = process.env.USER
const pass= process.env.PASS

export async function startMailConsumer(): Promise<void> {
    const channel = getChannel();

    await channel.assertExchange(exchange, "direct", {
        durable: true,
    })

    await channel.assertQueue(queue, { durable: true })

    await channel.bindQueue(queue, exchange, routingkey);

    console.log("Mail consumer started and waiting for messages");

    channel.consume(queue, async (message) => {
        if (!message) return;
        if(message){
            try {
                const { to,subject,body}= JSON.parse(message.content.toString())
                const transporter = nodemailer.createTransport({
                    host:"smtp.gmail.com",
                    port:465,
                    auth:{
                        user,
                        pass,
                    }
                })

                await transporter.sendMail({
                    from:"EM MATLADUTUNAVU RA - CHATT APP",
                    to,
                    subject,
                    text:body,
                })
                console.log(`OTP mail sent to ${to} Succesfully`);
                channel.ack(message);
            } catch (error) {
                console.log("failed to send OTP ",error);
                
            }
        }
    })
}
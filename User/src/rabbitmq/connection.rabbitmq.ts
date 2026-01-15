import amqp from 'amqplib';
import type { ChannelModel, Channel } from 'amqplib';
import { setupRabbit } from './setup.rabbitmq.js';

let connection:ChannelModel | null = null;
let channel: Channel | null = null ;

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error('RABBITMQ_URL missing');
  }

  connection = await amqp.connect(url);
  channel = await connection.createChannel();
  
  connection.on('sucess',()=>{
    setupRabbit();
    console.log("RabbitMQ setup succesfull");
    

})

  connection.on('error', (err) => {
    console.error('RabbitMQ connection error:', err);
  });

  connection.on('close', () => {
    console.error('RabbitMQ connection closed');
    connection = null;
    channel = null;
  });

  console.log('RabbitMQ connected');
  return channel;
};



export function getChannel() {
  if (!channel) throw new Error("RabbitMQ not connected");
  return channel;
}

